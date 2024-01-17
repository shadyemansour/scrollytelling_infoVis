class DataPaths {
    static get USAGE_DATA() {
      return './data/usage.csv';
    }
    static get PRICE_TREND_DATA() {
      return './data/price_trend.csv';
    }
    static get FINE_DATA() {
      return './data/fine.csv';
    }
  
    static get MAP_DATA() {
      return './data/map_de.json';
    }

    static get CITY_BIKE_RATING() {
      return './data/city_bike_rating.CSV';
    }
  
    // Add more paths as needed
  
    // Example of a method to generate dynamic paths
    static getUserSpecificDataPath(userId) {
      return `/path/to/user/${userId}/data.json`;
    }
}
  
module.exports = DataPaths;