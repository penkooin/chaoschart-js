export default {
  "TITLE": "Sample Chart",
  "xIndex": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "yIndex": [10, 20, 30, 40, 50, 60, 70, 80, 500],
  "indent_left": 0,
  "INDENT_RIGHT": 0,
  "INDENT_TOP": 0,
  "INDENT_BOTTOM": 0,
  "LIMIT": 900,
  "LEGEND_FONT_SIZE": 8,
  "IS_SHOW_PEAK": true,
  "IS_SHOW_GRAPH_BACKGROUND": false,
  "PEEK_STYLE": "RECTANGLE",
  "elements": {
    "kafka": { "color": "rgb(0,200,83)", "values": [44, 35, 0, 32, 0, 33, 29, 43, 25, 22, 32, 43] },         // vivid green
    "elk": { "color": "rgb(255,87,34)", "values": [150, 25, 10, 32, 0, 23, 52, 32, 32, 23, 54, 23] },         // vivid orange
    "Oracle": { "color": "rgb(255,235,59)", "values": [500, 193, 0, 49, 444, 24, 93, 63, 92, 84, 69, 46] },   // vivid yellow
    "maria": { "color": "rgb(33,150,243)", "values": [300, 25, 0, 32, 0, 23, 9, 19, 32, 70, 93, 29] },        // vivid blue
    "s3": { "color": "rgb(156,39,176)", "values": [20, 36, 0, 24, 22, 37, 33, 54, 23, 48, 53, 300] }          // vivid purple
  }
};
