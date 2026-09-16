import { slugify } from "@/lib/utils";

export type LocationTree = Record<string, Record<string, string[]>>;

/** Hierarchical Pakistan location dataset reused from the original GharRent prototype. */
export const LOCATION_TREE: LocationTree = {
  Punjab: {
    Lahore: ["Lahore City", "Raiwind", "Model Town", "Shalimar", "Cantonment", "Ravi"],
    Rawalpindi: ["Rawalpindi", "Gujar Khan", "Kahuta", "Kallar Syedan", "Kotli Sattian", "Murree"],
    Faisalabad: ["Faisalabad City", "Jaranwala", "Samundri", "Tandlianwala", "Chak Jhumra"],
    Gujranwala: ["Gujranwala City", "Kamoke", "Nowshera Virkan", "Wazirabad"],
    Multan: ["Multan City", "Shujabad", "Jalalpur Pirwala"],
    Sialkot: ["Sialkot", "Daska", "Pasrur", "Sambrial"],
    Bahawalpur: ["Bahawalpur City", "Ahmadpur East", "Hasilpur", "Khairpur Tamewali", "Yazman"],
    Sargodha: ["Sargodha", "Bhalwal", "Bhera", "Kot Momin", "Sahiwal", "Shahpur"],
    Sheikhupura: ["Sheikhupura", "Ferozewala", "Muridke", "Safdarabad", "Sharaqpur"],
    Jhelum: ["Jhelum", "Dina", "Pind Dadan Khan", "Sohawa"],
    Gujrat: ["Gujrat", "Kharian", "Sarai Alamgir"],
    Attock: ["Attock", "Fateh Jang", "Hazro", "Hasan Abdal", "Jand", "Pindi Gheb"],
    Chakwal: ["Chakwal", "Choa Saidan Shah", "Kallar Kahar", "Talagang"],
    Mianwali: ["Mianwali", "Esakhel", "Piplan"],
    Khushab: ["Khushab", "Naushera", "Quaidabad", "Noorpur Thal"],
    Dera_Ghazi_Khan: ["Dera Ghazi Khan", "Kot Chutta", "Taunsa"],
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
    Jhang: ["Jhang", "Shorkot", "18-Hazari", "Ahmadpur Sial"],
  },
  Sindh: {
    Karachi: ["Karachi Central", "Karachi East", "Karachi South", "Karachi West", "Korangi", "Malir", "Keamari"],
    Hyderabad: ["Hyderabad City", "Latifabad", "Qasimabad", "Hyderabad Rural"],
    Sukkur: ["Sukkur City", "New Sukkur", "Rohri", "Salehpat"],
    Larkana: ["Larkana", "Dokri", "Ratodero", "Bakrani"],
    Mirpur_Khas: ["Mirpur Khas", "Digri", "Kot Ghulam Muhammad", "Sindhri", "Jhuddo"],
    Nawabshah: ["Nawabshah", "Daur", "Sakrand", "Qazi Ahmed"],
    Thatta: ["Thatta", "Mirpur Sakro", "Keti Bandar", "Ghorabari"],
    Badin: ["Badin", "Golarchi", "Matli", "Shaheed Fazil Rahu", "Talhar"],
    Dadu: ["Dadu", "Johi", "Khairpur Nathan Shah", "Mehar"],
    Jacobabad: ["Jacobabad", "Garhi Khairo", "Thul"],
    Khairpur: ["Khairpur", "Gambat", "Kingri", "Kot Diji", "Nara", "Sobhodero"],
    Sanghar: ["Sanghar", "Jam Nawaz Ali", "Khipro", "Shahdadpur", "Sinjhoro", "Tando Adam"],
    Tando_Muhammad_Khan: ["Tando Muhammad Khan", "Bulri Shah Karim", "Tando Ghulam Hyder"],
    Tando_Allahyar: ["Tando Allahyar", "Jhando Mari", "Chamber"],
    Umerkot: ["Umerkot", "Kunri", "Pithoro", "Samaro"],
    Ghotki: ["Ghotki", "Daharki", "Khangarh", "Mirpur Mathelo", "Ubauro"],
  },
  "Khyber Pakhtunkhwa": {
    Peshawar: ["Peshawar City", "Chamkani", "Badaber", "Hassan Khel", "Mathra"],
    Abbottabad: ["Abbottabad", "Havelian", "Lora"],
    Mardan: ["Mardan", "Katlang", "Takht-i-Bahi"],
    Swat: ["Babuzai", "Barikot", "Kabal", "Khwazakhela", "Matta", "Mingora"],
    Nowshera: ["Nowshera", "Jehangira", "Pabbi"],
    Kohat: ["Kohat", "Darra Adam Khel", "Lachi"],
    Mansehra: ["Mansehra", "Baffa Pakhal", "Balakot", "Oghi"],
    Haripur: ["Haripur", "Ghazi", "Khanpur"],
    Charsadda: ["Charsadda", "Shabqadar", "Tangi"],
    Bannu: ["Bannu", "Domel", "Kakki"],
    Dera_Ismail_Khan: ["Dera Ismail Khan", "Kulachi", "Paharpur", "Paroa"],
    Swabi: ["Swabi", "Lahor", "Topi"],
    Dir_Upper: ["Barawal", "Dir", "Kalkot", "Wari"],
    Dir_Lower: ["Adenzai", "Balambat", "Lal Qilla", "Samar Bagh", "Timergara"],
    Malakand: ["Batkhela", "Dargai"],
    Shangla: ["Alpuri", "Puran"],
    Buner: ["Daggar", "Gagra", "Khudu Khel"],
    Karak: ["Karak", "Banda Daud Shah", "Takht-e-Nasrati"],
    Hangu: ["Hangu", "Tall"],
    Lakki_Marwat: ["Lakki Marwat", "Sarai Gambila", "Naurang"],
    Chitral: ["Chitral", "Mastuj"],
    Tank: ["Tank", "Jandola"],
  },
  Balochistan: {
    Quetta: ["Quetta City", "Chaman", "Nushki"],
    Gwadar: ["Gwadar", "Ormara", "Pasni", "Jiwani"],
    Khuzdar: ["Khuzdar", "Nal", "Wadh", "Zehri"],
    Turbat: ["Turbat", "Buleda", "Dasht"],
    Sibi: ["Sibi", "Kutmandai"],
    Zhob: ["Zhob", "Sherani"],
    Chagai: ["Dalbandin", "Nok Kundi", "Taftan"],
    Loralai: ["Loralai", "Duki", "Mekhtar"],
    Lasbela: ["Hub", "Bela", "Dureji"],
    Mastung: ["Mastung", "Dasht"],
    Killa_Saifullah: ["Killa Saifullah", "Muslim Bagh"],
    Pishin: ["Pishin", "Barshore", "Hurramzai"],
  },
  Islamabad: {
    Islamabad: ["Islamabad"],
  },
  Gilgit_Baltistan: {
    Gilgit: ["Gilgit", "Danyor", "Jutial"],
    Skardu: ["Skardu", "Gamba Skardu", "Roundu"],
    Hunza: ["Aliabad", "Gojal", "Nagar"],
    Ghizer: ["Gahkuch", "Ishkoman", "Punial"],
  },
  "Azad Jammu & Kashmir": {
    Muzaffarabad: ["Muzaffarabad", "Naseerabad", "Patikka"],
    Mirpur: ["Mirpur", "Dadyal", "Chakswari"],
    Rawalakot: ["Rawalakot", "Hajira", "Thorar"],
    Kotli: ["Kotli", "Charhoi", "Fatehpur Thakiala"],
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
        name: displayName(districtKey),
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
