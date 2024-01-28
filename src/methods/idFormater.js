function formatItemID(serverId, itemId) {
  return `${serverId}:${itemId}`;
}

function parseItemID(formattedItem) {
  const [serverId, itemId] = formattedItem.split(":");
  return { serverId, itemId };
}

module.exports = {
  formatItemID,
  parseItemID,
};
