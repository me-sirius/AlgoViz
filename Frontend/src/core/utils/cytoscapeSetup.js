import cytoscape from "cytoscape";

// Flag to track registration
let extensionsRegistered = false;

/**
 * Register cytoscape extensions
 * Call this before using cytoscape in a component
 */
export const registerCytoscapeExtensions = () => {
  if (extensionsRegistered) return;

  try {
    // Dynamic import to avoid bundling issues
    import("cytoscape-cose-bilkent").then((module) => {
      const extension = module.default || module;
      if (typeof extension === 'function' && !extensionsRegistered) {
        cytoscape.use(extension);
        extensionsRegistered = true;
      }
    }).catch((err) => {
      console.warn("Could not load cytoscape-cose-bilkent:", err);
    });
  } catch (error) {
    console.warn("Error registering Cytoscape extensions:", error);
  }
};

// Try to register extensions on module load
registerCytoscapeExtensions();

export default cytoscape;