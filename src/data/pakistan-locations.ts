import { slugify } from "../lib/utils.ts";

export type LocationTree = Record<string, Record<string, string[]>>;

/**
 * Province → City/district → tehsil/town.
 * Sources: Wikipedia “Districts of Pakistan” (2024, 169 districts),
 * “Tehsils of Punjab, Pakistan”, “List of tehsils of Khyber Pakhtunkhwa”,
 * “List of talukas of Sindh”, “List of tehsils of Balochistan”,
 * “Districts of Gilgit–Baltistan”, AJK district list.
 * Existing city keys are preserved so live listings keep resolving.
 */
export const LOCATION_TREE: LocationTree = {
  Punjab: {
    Lahore: ["Lahore City", "Raiwind", "Model Town", "Shalimar", "Cantonment", "Ravi", "Lahore Cantonment"],
    Rawalpindi: ["Rawalpindi", "Gujar Khan", "Kahuta", "Kallar Syedan", "Kotli Sattian", "Murree", "Taxila", "Daultala"],
    Murree: ["Murree", "Kotli Sattian"],
    Faisalabad: ["Faisalabad City", "Faisalabad Sadar", "Jaranwala", "Samundri", "Tandlianwala", "Chak Jhumra"],
    Gujranwala: ["Gujranwala City", "Gujranwala Saddar", "Kamoke", "Nowshera Virkan", "Wazirabad"],
    Wazirabad: ["Wazirabad", "Ali Pur Chatta"],
    Multan: ["Multan City", "Multan Saddar", "Shujabad", "Jalalpur Pirwala"],
    Sialkot: ["Sialkot", "Daska", "Pasrur", "Sambrial"],
    Bahawalpur: ["Bahawalpur City", "Bahawalpur Saddar", "Ahmadpur East", "Hasilpur", "Khairpur Tamewali", "Yazman"],
    Sargodha: ["Sargodha", "Bhalwal", "Bhera", "Kot Momin", "Sahiwal", "Shahpur", "Sillanwali"],
    Sheikhupura: ["Sheikhupura", "Ferozewala", "Muridke", "Safdarabad", "Sharaqpur"],
    Jhelum: ["Jhelum", "Dina", "Pind Dadan Khan", "Sohawa"],
    Gujrat: ["Gujrat", "Kharian", "Sarai Alamgir", "Jalalpur Jattan", "Kunjah"],
    Attock: ["Attock", "Fateh Jang", "Hazro", "Hasan Abdal", "Jand", "Pindi Gheb"],
    Chakwal: ["Chakwal", "Choa Saidan Shah", "Kallar Kahar", "Talagang"],
    Talagang: ["Talagang", "Lawa", "Multan Khurd"],
    Mianwali: ["Mianwali", "Esakhel", "Piplan"],
    Khushab: ["Khushab", "Naushera", "Quaidabad", "Noorpur Thal"],
    Dera_Ghazi_Khan: ["Dera Ghazi Khan", "Kot Chutta", "Taunsa", "Koh-e-Suleman"],
    Taunsa: ["Taunsa", "Koh-e-Suleman"],
    Rahim_Yar_Khan: ["Rahim Yar Khan", "Khanpur", "Liaquatpur", "Sadiqabad"],
    Sahiwal: ["Sahiwal", "Chichawatni"],
    Okara: ["Okara", "Depalpur", "Renala Khurd"],
    Kasur: ["Kasur", "Chunian", "Kot Radha Kishan", "Pattoki"],
    Nankana_Sahib: ["Nankana Sahib", "Shah Kot", "Sangla Hill"],
    Narowal: ["Narowal", "Shakargarh", "Zafarwal"],
    Hafizabad: ["Hafizabad", "Pindi Bhattian"],
    Mandi_Bahauddin: ["Mandi Bahauddin", "Malakwal", "Phalia"],
    Pakpattan: ["Pakpattan", "Arifwala"],
    Lodhran: ["Lodhran", "Dunyapur", "Kahror Pacca"],
    Vehari: ["Vehari", "Burewala", "Mailsi"],
    Bahawalnagar: ["Bahawalnagar", "Chishtian", "Fort Abbas", "Haroonabad", "Minchinabad"],
    Jhang: ["Jhang", "Shorkot", "18-Hazari", "Ahmadpur Sial", "Mandi Shah Jeewna"],
    Bhakkar: ["Bhakkar", "Darya Khan", "Kaloorkot", "Mankera"],
    Chiniot: ["Chiniot", "Bhowana", "Lalian"],
    Khanewal: ["Khanewal", "Kabirwala", "Mian Channu", "Jahanian"],
    Layyah: ["Layyah", "Karor Lal Esan", "Chaubara"],
    Muzaffargarh: ["Muzaffargarh", "Alipur", "Jatoi", "Kot Addu"],
    Kot_Addu: ["Kot Addu", "Chowk Sarwar Shaheed"],
    Rajanpur: ["Rajanpur", "Jampur", "Rojhan"],
    Toba_Tek_Singh: ["Toba Tek Singh", "Gojra", "Kamalia", "Pirmahal"],
  },
  Sindh: {
    Karachi: ["Karachi Central", "Karachi East", "Karachi South", "Karachi West", "Korangi", "Malir", "Keamari"],
    Hyderabad: ["Hyderabad City", "Latifabad", "Qasimabad", "Hyderabad Rural"],
    Sukkur: ["Sukkur City", "New Sukkur", "Rohri", "Salehpat", "Pano Aqil"],
    Larkana: ["Larkana", "Dokri", "Ratodero", "Bakrani"],
    Mirpur_Khas: ["Mirpur Khas", "Digri", "Kot Ghulam Muhammad", "Sindhri", "Jhuddo"],
    Nawabshah: ["Nawabshah", "Daur", "Sakrand", "Qazi Ahmed"],
    Thatta: ["Thatta", "Mirpur Sakro", "Keti Bandar", "Ghorabari"],
    Badin: ["Badin", "Golarchi", "Matli", "Shaheed Fazil Rahu", "Talhar", "Tando Bago"],
    Dadu: ["Dadu", "Johi", "Khairpur Nathan Shah", "Mehar"],
    Jacobabad: ["Jacobabad", "Garhi Khairo", "Thul"],
    Khairpur: ["Khairpur", "Gambat", "Kingri", "Kot Diji", "Nara", "Sobhodero", "Faiz Ganj"],
    Sanghar: ["Sanghar", "Jam Nawaz Ali", "Khipro", "Shahdadpur", "Sinjhoro", "Tando Adam"],
    Tando_Muhammad_Khan: ["Tando Muhammad Khan", "Bulri Shah Karim", "Tando Ghulam Hyder"],
    Tando_Allahyar: ["Tando Allahyar", "Jhando Mari", "Chamber"],
    Umerkot: ["Umerkot", "Kunri", "Pithoro", "Samaro"],
    Ghotki: ["Ghotki", "Daharki", "Khangarh", "Mirpur Mathelo", "Ubauro"],
    Jamshoro: ["Kotri", "Sehwan", "Manjhand", "Thano Bula Khan", "Jamshoro"],
    Matiari: ["Matiari", "Hala", "Saeedabad"],
    Naushahro_Feroze: ["Naushahro Feroze", "Bhiria", "Kandiaro", "Mehrabpur", "Moro"],
    Qambar_Shahdadkot: ["Qambar", "Shahdadkot", "Miro Khan", "Nasirabad", "Qubo Saeed Khan", "Warah", "Sijawal Junejo"],
    Kashmore: ["Kashmore", "Kandhkot", "Tangwani"],
    Shikarpur: ["Shikarpur", "Garhi Yasin", "Lakhi", "Khanpur"],
    Sujawal: ["Sujawal", "Jati", "Mirpur Bathoro", "Shah Bunder", "Kharo Chan"],
    Tharparkar: ["Mithi", "Islamkot", "Nagarparkar", "Diplo", "Chachro", "Dahli", "Kaloi"],
  },
  "Khyber Pakhtunkhwa": {
    Peshawar: ["Peshawar City", "Chamkani", "Badaber", "Hassan Khel", "Mathra", "Peshtakhara", "Shah Alam"],
    Abbottabad: ["Abbottabad", "Havelian", "Lora", "Lower Tanawal"],
    Mardan: ["Mardan", "Katlang", "Takht-i-Bahi", "Rustam", "Garhi Kapura"],
    Swat: ["Babuzai", "Barikot", "Kabal", "Khwazakhela", "Matta", "Mingora", "Charbagh"],
    Upper_Swat: ["Matta", "Khwazakhela", "Bahrain"],
    Nowshera: ["Nowshera", "Jehangira", "Pabbi"],
    Kohat: ["Kohat", "Darra Adam Khel", "Lachi", "Gumbat"],
    Mansehra: ["Mansehra", "Baffa Pakhal", "Balakot", "Oghi", "Darband", "Tanawal"],
    Haripur: ["Haripur", "Ghazi", "Khanpur"],
    Charsadda: ["Charsadda", "Shabqadar", "Tangi"],
    Bannu: ["Bannu", "Domel", "Kakki", "Baka Khel", "Miryan", "Wazir"],
    Dera_Ismail_Khan: ["Dera Ismail Khan", "Kulachi", "Paharpur", "Paroa", "Daraban", "Paniala", "Drazanda"],
    Paharpur: ["Paharpur"],
    Swabi: ["Swabi", "Lahor", "Topi", "Razar"],
    Dir_Upper: ["Barawal", "Dir", "Kalkot", "Wari", "Sharingal"],
    Dir_Lower: ["Adenzai", "Balambat", "Lal Qilla", "Samar Bagh", "Timergara", "Khal", "Munda"],
    Central_Dir: ["Wari", "Lar Jam", "Akhagram Karo", "Nehag Dara", "Sahib Abad"],
    Malakand: ["Batkhela", "Dargai", "Sam Ranizai", "Swat Ranizai", "Thana Baizai", "Utman Khel"],
    Shangla: ["Alpuri", "Puran", "Bisham", "Chakesar", "Martung", "Makhuzai", "Shahpur"],
    Buner: ["Daggar", "Gagra", "Khudu Khel", "Gadezai", "Mandanr", "Chamla", "Chagharzai"],
    Karak: ["Karak", "Banda Daud Shah", "Takht-e-Nasrati"],
    Hangu: ["Hangu", "Tall", "Doaba"],
    Lakki_Marwat: ["Lakki Marwat", "Sarai Gambila", "Naurang", "Bettani", "Ghazni Khel"],
    Chitral: ["Chitral", "Mastuj", "Drosh"],
    Upper_Chitral: ["Mastuj", "Booni", "Mulkoh", "Torkoh"],
    Tank: ["Tank", "Jandola"],
    Battagram: ["Battagram", "Allai"],
    Allai: ["Allai"],
    Torghar: ["Judba", "Daur Maira", "Khander Hassanzai"],
    Upper_Kohistan: ["Dassu", "Kandia", "Seo", "Harban Basha"],
    Lower_Kohistan: ["Pattan", "Bankad"],
    Kolai_Palas: ["Kolai", "Palas"],
    Bajaur: ["Khar Bajaur", "Mamund", "Salarzai", "Nawagai", "Barang", "Utman Khel", "Bar Chamarkand"],
    Mohmand: ["Yake Ghund", "Safi", "Halim Zai", "Pindiali", "Pran Ghar", "Ambar Utman Khel", "Upper Mohmand"],
    Khyber: ["Landi Kotal", "Jamrud", "Bara", "Mula Gori", "Bagh Maidan", "Bazar Zakha Khel", "Fort Salop", "Painda Cheena"],
    Kurram: ["Parachinar", "Lower Kurram", "Central Kurram", "Upper Kurram"],
    Orakzai: ["Kalaya", "Lower Orakzai", "Upper Orakzai", "Central Orakzai", "Ismail Zai"],
    North_Waziristan: ["Miranshah", "Mir Ali", "Razmak", "Datta Khel", "Spinwam", "Shewa", "Ghulam Khan", "Dossali", "Gharyum"],
    Lower_South_Waziristan: ["Wana", "Birmil", "Shakai", "Toi Khulla"],
    Upper_South_Waziristan: ["Ladha", "Makin", "Sararogha", "Sarwakai", "Tiarza", "Shaktoi", "Shawal"],
  },
  Balochistan: {
    Quetta: ["Quetta City", "Chaman", "Nushki", "Kuchlak", "Sariab", "Zarghoon"],
    Gwadar: ["Gwadar", "Ormara", "Pasni", "Jiwani", "Suntsar"],
    Khuzdar: ["Khuzdar", "Nal", "Wadh", "Zehri", "Baghbana"],
    Turbat: ["Turbat", "Buleda", "Dasht", "Tump", "Mand", "Hoshab"],
    Sibi: ["Sibi", "Kutmandai", "Lehri", "Sangan"],
    Zhob: ["Zhob", "Sherani", "Qamar Din Karez"],
    Chagai: ["Dalbandin", "Nok Kundi", "Taftan", "Chagai"],
    Loralai: ["Loralai", "Duki", "Mekhtar", "Bori"],
    Lasbela: ["Hub", "Bela", "Dureji", "Uthal", "Gadani", "Sonmiani", "Kanraj"],
    Mastung: ["Mastung", "Dasht", "Kardigap"],
    Killa_Saifullah: ["Killa Saifullah", "Muslim Bagh", "Kan Mehtarzai"],
    Pishin: ["Pishin", "Barshore", "Hurramzai", "Karezat", "Bostan", "Saranan"],
    Hub: ["Hub", "Gadani", "Sonmiani", "Sakran"],
    Chaman: ["Chaman"],
    Nushki: ["Nushki", "Dak"],
    Kalat: ["Kalat", "Mangochar", "Johan"],
    Awaran: ["Awaran", "Mashkay", "Jhal Jhao"],
    Kharan: ["Kharan", "Sar Kharan"],
    Washuk: ["Washuk", "Besima", "Mashkel"],
    Panjgur: ["Panjgur", "Paroom", "Gichk"],
    Jafarabad: ["Dera Allah Yar", "Jafarabad"],
    Nasirabad: ["Dera Murad Jamali", "Baba Kot"],
    Jhal_Magsi: ["Jhal Magsi", "Gandawah"],
    Sohbatpur: ["Sohbatpur"],
    Usta_Muhammad: ["Usta Muhammad", "Gandakha"],
    Dera_Bugti: ["Dera Bugti", "Sui", "Phelawagh"],
    Kohlu: ["Kohlu", "Kahan", "Maiwand"],
    Barkhan: ["Barkhan"],
    Musakhel: ["Musakhel", "Kingri", "Darug"],
    Harnai: ["Harnai", "Shahrig"],
    Ziarat: ["Ziarat", "Sinjawi"],
    Duki: ["Duki"],
    Kacchi: ["Dhadar", "Bhag", "Machh"],
    Qila_Abdullah: ["Qila Abdullah", "Gulistan", "Dobandi"],
    Sherani: ["Sherani"],
    Surab: ["Surab"],
    Wadh: ["Wadh"],
    Taftan: ["Taftan"],
  },
  Islamabad: {
    Islamabad: ["Islamabad"],
  },
  Gilgit_Baltistan: {
    Gilgit: ["Gilgit", "Danyor", "Jutial"],
    Skardu: ["Skardu", "Gamba Skardu", "Roundu"],
    Hunza: ["Aliabad", "Gojal", "Nagar", "Karimabad"],
    Ghizer: ["Gahkuch", "Ishkoman", "Punial", "Phander"],
    Ghanche: ["Khaplu", "Mashabrum", "Daghoni"],
    Shigar: ["Shigar", "Gulabpur"],
    Kharmang: ["Kharmang", "Tolti"],
    Nagar: ["Nagar", "Sikandarabad", "Chalt"],
    Diamer: ["Chilas", "Darel", "Tangir"],
    Astore: ["Astore", "Eidghah", "Shounter"],
    Roundu: ["Roundu", "Dambudas"],
    Darel: ["Darel"],
    Tangir: ["Tangir"],
    Gupis_Yasin: ["Gupis", "Yasin", "Phander"],
  },
  "Azad Jammu & Kashmir": {
    Muzaffarabad: ["Muzaffarabad", "Naseerabad", "Patikka"],
    Mirpur: ["Mirpur", "Dadyal", "Chakswari"],
    Rawalakot: ["Rawalakot", "Hajira", "Thorar"],
    Kotli: ["Kotli", "Charhoi", "Fatehpur Thakiala"],
    Bagh: ["Bagh", "Dhirkot", "Hari Ghel"],
    Bhimber: ["Bhimber", "Samahni", "Barnala"],
    Hattian_Bala: ["Hattian Bala", "Chikar", "Leepa"],
    Neelum: ["Athmuqam", "Sharda", "Kel"],
    Haveli: ["Forward Kahuta", "Haveli"],
    Sudhanoti: ["Pallandri", "Trarkhel", "Balouch"],
  },
};

export const PROVINCE_DISPLAY: Record<string, string> = {
  Punjab: "Punjab",
  Sindh: "Sindh",
  "Khyber Pakhtunkhwa": "Khyber Pakhtunkhwa",
  Balochistan: "Balochistan",
  Islamabad: "Islamabad Capital Territory",
  Gilgit_Baltistan: "Gilgit-Baltistan",
  "Azad Jammu & Kashmir": "Azad Jammu & Kashmir",
};

export function displayName(value: string): string {
  return PROVINCE_DISPLAY[value] || value.replaceAll("_", " ");
}

export function provinceId(provinceKey: string): string {
  return slugify(displayName(provinceKey));
}

export function districtId(provinceKey: string, districtKey: string): string {
  return `${provinceId(provinceKey)}-${slugify(districtKey)}`;
}

export function tehsilId(provinceKey: string, districtKey: string, tehsilName: string): string {
  return `${districtId(provinceKey, districtKey)}-${slugify(tehsilName)}`;
}

export type FlatProvince = { id: string; slug: string; name: string; sortOrder: number };
export type FlatDistrict = { id: string; provinceId: string; slug: string; name: string };
export type FlatTehsil = { id: string; districtId: string; slug: string; name: string };

export function flattenLocations(): {
  provinces: FlatProvince[];
  districts: FlatDistrict[];
  tehsils: FlatTehsil[];
} {
  const provinces: FlatProvince[] = [];
  const districts: FlatDistrict[] = [];
  const tehsils: FlatTehsil[] = [];
  let sort = 0;
  for (const [provinceKey, districtMap] of Object.entries(LOCATION_TREE)) {
    const pId = provinceId(provinceKey);
    provinces.push({
      id: pId,
      slug: pId,
      name: displayName(provinceKey),
      sortOrder: sort,
    });
    sort += 1;
    for (const [districtKey, tehsilNames] of Object.entries(districtMap)) {
      const dId = districtId(provinceKey, districtKey);
      districts.push({
        id: dId,
        provinceId: pId,
        slug: slugify(districtKey),
        name: districtKey.replaceAll("_", " "),
      });
      for (const tehsilName of tehsilNames) {
        const tId = tehsilId(provinceKey, districtKey, tehsilName);
        tehsils.push({
          id: tId,
          districtId: dId,
          slug: slugify(tehsilName),
          name: tehsilName,
        });
      }
    }
  }
  return { provinces, districts, tehsils };
}
