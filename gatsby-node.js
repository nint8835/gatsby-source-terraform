const flatten = require("lodash.flatten");

async function onCreateNode({
  node,
  loadNodeContent,
  actions,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions;
  function transformObject(obj) {
    const resourceNode = {
      path: obj.attributes.path,
      id: obj.attributes.id,
      parent: node.id,
      internal: {
        mediaType: "text/markdown",
        contentDigest: createContentDigest(obj),
        content: obj.attributes.page_text,
        type: "TerraformPage",
      },
    };
    createNode(resourceNode);
    createParentChildLink({ parent: node, child: resourceNode });
  }

  if (node.extension !== "tfstate") {
    return;
  }
  console.error(node);
  const content = await loadNodeContent(node);
  console.error(content);
  const tfState = JSON.parse(content);
  flatten(
    tfState.resources
      .filter((resource) => resource.type === "gatsby_page")
      .map((resource) => resource.instances)
  ).forEach(transformObject);
}

exports.onCreateNode = onCreateNode;
