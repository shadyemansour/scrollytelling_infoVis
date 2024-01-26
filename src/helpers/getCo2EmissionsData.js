import DataPaths from '../utils/constants.js';
import { getData} from '../utils.js';


export async function getCo2EmissionsData() {

    try {
        const data = await getData(DataPaths.CO2_EMISSIONS_DATA);
        const result = parseCSV(data);
        console.log(result);
        return result;
      } catch (err) {
        console.error('Error fetching or parsing data:', err);
        throw err; // Rethrow the error to handle it at a higher level
      }
}
    
function parseCSV(data) {
    const result = [];

    data.forEach(entry => {
        const { type, usage, energies, vehicle, infrastructure } = entry;

        result.push({ year: type, fruit: 'usage', value: usage });
        result.push({ year: type, fruit: 'energies', value: energies });
        result.push({ year: type, fruit: 'vehicle', value: vehicle });
        result.push({ year: type, fruit: 'infrastructure', value: infrastructure });
    });

    return result;
}
    
export default getCo2EmissionsData;