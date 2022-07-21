module.exports = async (gasket, labels, { req }) => {
  const route = await req.getNextRoute();
  if (!route) {
    return labels;
  }

  const match = route.namedRegex.exec(req.url);
  if (!match) {
    return labels;
  }

  const { groups = {} } = match;
  return {
    ...labels,
    ...Object.fromEntries(
      Object.entries(groups).map(([key, value]) => [key, decodeURIComponent(value)])
    )
  };
};
