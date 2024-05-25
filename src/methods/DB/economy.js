const Wallet = require("./models/wallet");
const StoreItem = require("./models/storeItem");
const { parseItemID, formatItemID } = require("../idFormater");

async function getWallet(userId) {
  return await Wallet.findOne({ userId }) || new Wallet({ userId });
}

async function claim(userId, amount) {
  let userWallet = await getWallet(userId);
  userWallet.coins = (userWallet.coins || 0) + amount;
  userWallet.lastClaim = Date.now();

  await userWallet.save();
}

async function purchase(userId, serverId, guild, buyItemId, member) {
  let item = await StoreItem.findOne({ serverId, buyItemId: buyItemId });

  if (!item) return { success: false, reason: 'itemNotFound' };

  let user = await Wallet.findOne({ userId });
  if (!user || user.coins < item.price) return { success: false, reason: 'insufficientFunds' };

  if (!member) return { success: false, reason: 'memberNotFound' };
  if (member.roles.cache.has(item.itemId)) return { success: false, reason: 'userAlreadyHasTheRole' };

  let role = guild.roles.cache.get(item.itemId);
  if (!role) return { success: false, reason: 'roleNotFound' };

  try {
    await member.roles.add(role);
    let formatedItem = formatItemID(serverId, buyItemId);
    if (!user.items.includes(formatedItem)) {
      user.items.push(formatedItem);
      await user.save();
    }

    let addedByUserId = item.addedBy;
    let addedByUser = await Wallet.findOne({ userId: addedByUserId });

    if (addedByUser) {
      const rewardAmount = Math.round(item.price * 0.25);
      addedByUser.coins += rewardAmount;
      await addedByUser.save();
    } else {
      return { success: false, reason: 'itemCreatorNotFound' };
    }

    user.coins -= item.price;
    await user.save();

    return { success: true, item: item, addedByUserId: addedByUserId };
  } catch (error) {
    console.error("Erro ao comprar o item:", error);
    return { success: false, reason: 'internalError' };
  }
}

async function sell(userId, serverId, guild, buyItemId, member) {
  let item = await StoreItem.findOne({ serverId, buyItemId: buyItemId, });
  if (!item) return 'itemNotFound'

  let itemId = item.itemId;
  let user = await Wallet.findOne({ userId });

  if (user?.items.includes(formatItemID(serverId, buyItemId))) {
    if (member?.roles.cache.has(itemId)) {
      let role = guild.roles.cache.get(itemId)
      if (role) { await member.roles.remove(role) } else { return 'errorRemovingTheRole' }

      user.items = user.items.filter((itemId) => itemId !== formatItemID(serverId, buyItemId))
      const amountGained = Math.round(item.price * 0.25);
      user.coins += amountGained;
      await user.save();
      return 'saleSuccessfull'
    } else { return 'userDontHaveTheRole' }
  } else { return 'userDontHaveTheItem' }
}

async function inventory(userId, serverId) {
  let user = await Wallet.findOne({ userId });
  let foundItems = [];

  for (let formattedItem of user.items) {
    let pItemId = parseItemID(formattedItem).itemId;
    let items = await StoreItem.findOne({
      serverId: serverId,
      buyItemId: pItemId,
    });
    if (items) {
      foundItems.push(items);
    }
  }

  return foundItems;
}

async function transferCoins(senderId, recipientId, amount) {
  const sender = await Wallet.findOne({ userId: senderId });
  const recipient = await Wallet.findOne({ userId: recipientId });

  if (!sender || sender.coins < amount) {
    throw new Error("Saldo insuficiente!");
  }

  sender.coins -= amount;
  const updatedSender = await sender.save();

  const updatedRecipient =
    recipient ||
    (await Wallet.create({ userId: recipientId, coins: 0 }));
  updatedRecipient.coins += amount;
  await updatedRecipient.save();

  return {
    title: "Pagamento realizado!",
    description: `Você enviou \`${amount} moedas\` para <@${recipientId}>.\nSeu saldo atual: \`${updatedSender.coins} moedas\``,
  };
}

async function getItemsByServerId(serverId) {
  try {
    const items = await StoreItem.find({ serverId });
    return items;
  } catch (error) {
    console.error("Erro ao obter itens da loja por ID do servidor:", error);
    throw new Error("Erro ao obter itens da loja por ID do servidor");
  }
}

module.exports = { getWallet, claim, purchase, sell, inventory, transferCoins, getItemsByServerId };
