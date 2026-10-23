"use strict";
(function () {
  const client = window.EsProfeCatalogLoader.createCatalogClient({
    level: "A1",
    catalogUrl: "data/a1-catalog.json?v=20261023-unified-loader1",
    onCatalog: catalog => window.setA1LessonCatalog?.(catalog)
  });
  window.EsProfeA1Catalog = client;
  client.catalog().catch(error => console.error(error));
})();
