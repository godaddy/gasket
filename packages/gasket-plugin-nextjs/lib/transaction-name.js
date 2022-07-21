module.exports = async (gasket, name, { req }) => {
  const route = await req.getNextRoute();
  return route ? route.page : name;
};
