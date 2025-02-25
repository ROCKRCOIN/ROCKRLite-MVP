// Define all the SVG paths for experience icons
export const iconPaths = {
  details: {
    viewBox: "0 0 24 24",
    color: "#6B7280",
    path: "M4 4v16h16V4H4zm1 1h14v14H5V5zm2 2v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h10v-2H7z"
  },
  rockrcoin: {
    viewBox: "0 0 24 24",
    color: "#FCD34D",
    elements: [
      {
        type: "circle",
        attributes: {
          cx: 12,
          cy: 12,
          r: 10,
          fill: "none",
          stroke: "#FCD34D",
          strokeWidth: 2
        }
      },
      {
        type: "text",
        content: "RKS",
        attributes: {
          x: 12,
          y: 16,
          fontSize: 8,
          textAnchor: "middle",
          fill: "#FCD34D",
          fontWeight: "bold"
        }
      }
    ]
  },
  calendar: {
    viewBox: "0 0 24 24",
    color: "#EC4899",
    elements: [
      {
        type: "path",
        attributes: {
          d: "M5 4v14h14V4H5zm1 2h12v2H6V6zm0 3h12v8H6V9z",
          fill: "#EC4899"
        }
      },
      {
        type: "rect",
        attributes: {
          x: 8,
          y: 11,
          width: 2,
          height: 2,
          fill: "#EC4899"
        }
      },
      {
        type: "rect",
        attributes: {
          x: 11,
          y: 11,
          width: 2,
          height: 2,
          fill: "#EC4899"
        }
      },
      {
        type: "rect",
        attributes: {
          x: 14,
          y: 11,
          width: 2,
          height: 2,
          fill: "#EC4899"
        }
      }
    ]
  },
  location: {
    viewBox: "0 0 24 24",
    color: "#EF4444",
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
  },
  hosts: {
    viewBox: "0 0 24 24",
    color: "#8B5CF6",
    elements: [
      {
        type: "path",
        attributes: {
          d: "M12 3L4 7l8 4 6.93-3.46L20 11v-1l-8-4z",
          fill: "#8B5CF6"
        }
      },
      {
        type: "path",
        attributes: {
          d: "M8 13.28V16c0 1 2 2 4 2s4-1 4-2v-2.72l-4 2-4-2z",
          fill: "#8B5CF6"
        }
      },
      {
        type: "rect",
        attributes: {
          x: 19,
          y: 10,
          width: 1,
          height: 4,
          fill: "#8B5CF6"
        }
      }
    ]
  },
  authentication: {
    viewBox: "0 0 24 24",
    color: "#059669",
    path: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l6 2.7v4.7c0 4.05-2.78 7.7-6 8.83-3.22-1.13-6-4.78-6-8.83v-4.7l6-2.7z"
  },
  review: {
    viewBox: "0 0 24 24",
    color: "#10B981",
    elements: [
      {
        type: "circle",
        attributes: {
          cx: 12,
          cy: 12,
          r: 10,
          fill: "none",
          stroke: "#10B981",
          strokeWidth: 2
        }
      },
      {
        type: "path",
        attributes: {
          d: "M8 12l3 3 5-5",
          stroke: "#10B981",
          strokeWidth: 3,
          fill: "none"
        }
      }
    ]
  }
};

export type IconType = keyof typeof iconPaths;
