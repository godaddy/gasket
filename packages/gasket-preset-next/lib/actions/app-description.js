export default function handleAppDescription(context) {
  if (!context.appDescription) return;
  context.pkg.add('description', context.appDescription);
}
