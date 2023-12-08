class DataPaths {
    static get REGION_DATA() {
      return './data/data_region.csv';
    }
    static get VERKEHR_DATA() {
      return './data/data_verkehr.csv';
    }
  
    static get TOPO_DATA() {
      return './data/1_sehr_hoch_topo.json';
    }
  
    // Add more paths as needed
  
    // Example of a method to generate dynamic paths
    static getUserSpecificDataPath(userId) {
      return `/path/to/user/${userId}/data.json`;
    }
}
  
module.exports = DataPaths;