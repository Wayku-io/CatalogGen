function sendResponse(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.end(JSON.stringify(data));
}

const manifest = {
  id: "org.wayku.tmdbstreamingfrance",
  version: "2.0.0",
  name: "Nouveautés Streaming & VOD",
  description: "Double catalogue Stremio : 1) Nouveautés Streaming SVOD France (Netflix, Prime, Disney+, Canal+, Apple TV+, Max) et 2) Sorties Digitales & VOD Mondiales (Achat/Location avec disponibilité FR).",
  resources: ["catalog"],
  types: ["movie"],
  catalogs: [
    {
      type: "movie",
      id: "streaming_fr_originals",
      name: "Nouveautés Streaming France (SVOD)",
      extra: [
        {
          name: "genre",
          options: [
            "Toutes Plateformes",
            "Netflix",
            "Prime Video",
            "Disney+",
            "Canal+",
            "Apple TV+",
            "Max"
          ],
          isRequired: false
        },
        {
          name: "skip",
          isRequired: false
        }
      ]
    },
    {
      type: "movie",
      id: "digital_vod_worldwide",
      name: "Nouveautés VOD & Digital (WEB-DL)",
      extra: [
        {
          name: "genre",
          options: [
            "Tous Genres",
            "Action",
            "Thriller",
            "Science-Fiction",
            "Comédie",
            "Drame",
            "Horreur",
            "Aventure"
          ],
          isRequired: false
        },
        {
          name: "skip",
          isRequired: false
        }
      ]
    }
  ]
};

function handler(req, res) {
  sendResponse(res, 200, manifest);
}

module.exports = handler;
module.exports.default = handler;
