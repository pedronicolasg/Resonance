const Wallet = require("./models/wallet");
const StoreItem = require("./models/storeItem");

async function getWallet(userId) {
  return await Wallet.findOne({ userId }) || new Wallet({ userId });
}

async function claim(userId, amount) {
  const userWallet = await getWallet(userId);
  userWallet.coins = (userWallet.coins || 0) + amount;
  userWallet.lastClaim = Date.now();
  await userWallet.save();
}

function formatItemID(serverId, itemId) {
  return `${serverId}:${itemId}`;
}

function parseItemID(formattedItem) {
  const [serverId, itemId] = formattedItem.split(":");
  return { serverId, itemId };
}

async function getStoreItem(serverId, buyItemId) {
  return await StoreItem.findOne({ serverId, buyItemId });
}

function hasSufficientFunds(user, amount) {
  return user && user.coins >= amount;
}

async function purchase(userId, serverId, guild, buyItemId, member) {
  const item = await getStoreItem(serverId, buyItemId);
  if (!item) return { success: false, reason: 'itemNotFound' };

  const user = await getWallet(userId);
  if (!hasSufficientFunds(user, item.price)) return { success: false, reason: 'insufficientFunds' };

  if (!member) return { success: false, reason: 'memberNotFound' };
  if (member.roles.cache.has(item.itemId)) return { success: false, reason: 'userAlreadyHasTheRole' };

  const role = guild.roles.cache.get(item.itemId);
  if (!role) return { success: false, reason: 'roleNotFound' };

  try {
    await member.roles.add(role);
    const formattedItem = formatItemID(serverId, buyItemId);

    if (!user.items.includes(formattedItem)) {
      user.items.push(formattedItem);
      await user.save();
    }

    const addedByUser = await getWallet(item.addedBy);
    if (addedByUser) {
      const rewardAmount = Math.round(item.price * 0.25);
      addedByUser.coins += rewardAmount;
      await addedByUser.save();
    } else {
      return { success: false, reason: 'itemCreatorNotFound' };
    }

    user.coins -= item.price;
    await user.save();

    return { success: true, item, addedByUserId: item.addedBy };
  } catch (error) {
    console.error("Erro ao comprar o item:", error);
    return { success: false, reason: 'internalError' };
  }
}

async function sell(userId, serverId, guild, buyItemId, member) {
  try {
    const item = await getStoreItem(serverId, buyItemId);
    if (!item) return 'itemNotFound';

    const itemId = item.itemId;
    const user = await getWallet(userId);
    const formattedItem = formatItemID(serverId, buyItemId);

    if (user.items.includes(formattedItem)) {
      const role = guild.roles.cache.get(itemId);
      if (!role) return 'errorRemovingTheRole';

      await member.roles.remove(role);
      user.items = user.items.filter(item => item !== formattedItem);
      const amountGained = Math.round(item.price * 0.25);
      user.coins += amountGained;
      await user.save();

      return { status: 'saleSuccessfull', amountGained };
    } else {
      return 'userDontHaveTheItem';
    }
  } catch (error) {
    console.error("Erro ao vender o item:", error);
    return 'internalError';
  }
}

async function inventory(userId, serverId) {
  const user = await Wallet.findOne({ userId });
  const foundItems = [];

  for (const formattedItem of user.items) {
    const { itemId } = parseItemID(formattedItem);
    const item = await StoreItem.findOne({ serverId, buyItemId: itemId });
    if (item) foundItems.push(item);
  }

  return foundItems;
}

async function transferCoins(senderId, recipientId, amount) {
  const sender = await getWallet(senderId);
  const recipient = await getWallet(recipientId);

  if (!hasSufficientFunds(sender, amount)) throw new Error("Saldo insuficiente!");

  sender.coins -= amount;
  await sender.save();

  recipient.coins += amount;
  await recipient.save();

  return {
    title: "Pagamento realizado!",
    description: `Você enviou \`${amount} moedas\` para <@${recipientId}>.\nSeu saldo atual: \`${sender.coins} moedas\``,
  };
}

async function getItemsByServerId(serverId) {
  try {
    return await StoreItem.find({ serverId });
  } catch (error) {
    console.error("Erro ao obter itens da loja por ID do servidor:", error);
    throw new Error("Erro ao obter itens da loja por ID do servidor");
  }
}

async function addItemToStore(serverId, itemId, buyItemId, name, description, price, addedBy) {
  const currentItemCount = await StoreItem.countDocuments({ serverId });

  if (currentItemCount >= 25) {
    return { success: false, message: "Limite máximo de 25 itens atingido." };
  }

  const newItem = await StoreItem.create({ serverId, itemId, buyItemId, name, description, price, addedBy });
  return { success: true, newItem };
}

async function removeItemsFromStore(serverId, buyItemIds) {
  const trimmedIds = buyItemIds.map(id => id.trim());
  const deletedItems = await StoreItem.find({ serverId, buyItemId: { $in: trimmedIds } });
  const result = await StoreItem.deleteMany({ serverId, buyItemId: { $in: trimmedIds } });

  return { deletedItems, deletedCount: result.deletedCount };
}

async function updateUserItems(serverId, deletedItems, guild) {
  for (const deletedItem of deletedItems) {
    const users = await Wallet.find({ items: formatItemID(serverId, deletedItem.buyItemId) });

    for (const user of users) {
      user.items = user.items.filter(item => item !== formatItemID(serverId, deletedItem.buyItemId));
      await user.save();

      const member = guild.members.cache.get(user.userId);
      const role = guild.roles.cache.get(deletedItem.itemId);
      if (member && role) {
        try {
          await member.roles.remove(role);
        } catch (e) {
          console.log(`Erro ao remover o cargo do usuário ${user.userId} devido à: ${e}`);
        }
      }
    }
  }
}

module.exports = {
  getWallet,
  claim,
  purchase,
  sell,
  inventory,
  transferCoins,
  getItemsByServerId,
  addItemToStore,
  removeItemsFromStore,
  updateUserItems,
};
