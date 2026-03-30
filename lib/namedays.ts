// Slovak nameday calendar (standard SK calendar)
// Key format: "month-day"
const NAMEDAYS: Record<string, string> = {
  // January
  '1-1': 'Nový rok',
  '1-2': 'Alexandra',
  '1-3': 'Daniela',
  '1-4': 'Drahoslav',
  '1-5': 'Andrea',
  '1-6': 'Antónia',
  '1-7': 'Bohuslav',
  '1-8': 'Severín',
  '1-9': 'Alexej',
  '1-10': 'Dáša',
  '1-11': 'Malvína',
  '1-12': 'Ernest',
  '1-13': 'Rastislav',
  '1-14': 'Radovan',
  '1-15': 'Dobroslav',
  '1-16': 'Kristína',
  '1-17': 'Nataša',
  '1-18': 'Bohuška',
  '1-19': 'Drahomíra',
  '1-20': 'Dalibor',
  '1-21': 'Vincent',
  '1-22': 'Zora',
  '1-23': 'Miloš',
  '1-24': 'Timotej',
  '1-25': 'Gejza',
  '1-26': 'Tamara',
  '1-27': 'Bohuš',
  '1-28': 'Alfonz',
  '1-29': 'Gašpar',
  '1-30': 'Ľubica',
  '1-31': 'Emil',
  // February
  '2-1': 'Tatiana',
  '2-2': 'Veronika',
  '2-3': 'Blažej',
  '2-4': 'Zdenko',
  '2-5': 'Agáta',
  '2-6': 'Dorota',
  '2-7': 'Vanda',
  '2-8': 'Zoja',
  '2-9': 'Apolónia',
  '2-10': 'Gabriela',
  '2-11': 'Dezider',
  '2-12': 'Perla',
  '2-13': 'Nina',
  '2-14': 'Valentín',
  '2-15': 'Pravoslav',
  '2-16': 'Ida',
  '2-17': 'Miloslava',
  '2-18': 'Jaromír',
  '2-19': 'Vlasta',
  '2-20': 'Lívia',
  '2-21': 'Eleonóra',
  '2-22': 'Etela',
  '2-23': 'Roman',
  '2-24': 'Matej',
  '2-25': 'Frederik',
  '2-26': 'Viktor',
  '2-27': 'Alexander',
  '2-28': 'Zlatica',
  '2-29': 'Radomír',
  // March
  '3-1': 'Albín',
  '3-2': 'Anežka',
  '3-3': 'Bohumil',
  '3-4': 'Kazimír',
  '3-5': 'Fridrich',
  '3-6': 'Radoslav',
  '3-7': 'Tomáš',
  '3-8': 'Alan',
  '3-9': 'Františka',
  '3-10': 'Branislav',
  '3-11': 'Anita',
  '3-12': 'Gregor',
  '3-13': 'Ľubomír',
  '3-14': 'Matilda',
  '3-15': 'Svetlana',
  '3-16': 'Víťazoslav',
  '3-17': 'Ľubica',
  '3-18': 'Eduard',
  '3-19': 'Jozef',
  '3-20': 'Víťazoslava',
  '3-21': 'Blahoslav',
  '3-22': 'Beňadik',
  '3-23': 'Adrián',
  '3-24': 'Gabriel',
  '3-25': 'Marián',
  '3-26': 'Emanuel',
  '3-27': 'Alžbeta',
  '3-28': 'Soňa',
  '3-29': 'Miroslav',
  '3-30': 'Vieroslava',
  '3-31': 'Benjamín',
  // April
  '4-1': 'Hugo',
  '4-2': 'Zita',
  '4-3': 'Richard',
  '4-4': 'Izidor',
  '4-5': 'Miroslava',
  '4-6': 'Irena',
  '4-7': 'Zoltán',
  '4-8': 'Albert',
  '4-9': 'Milena',
  '4-10': 'Igor',
  '4-11': 'Július',
  '4-12': 'Estera',
  '4-13': 'Aleš',
  '4-14': 'Tiburc',
  '4-15': 'Anastázia',
  '4-16': 'Dana',
  '4-17': 'Rudolf',
  '4-18': 'Valér',
  '4-19': 'Jela',
  '4-20': 'Marcel',
  '4-21': 'Ervín',
  '4-22': 'Slavomír',
  '4-23': 'Vojtech',
  '4-24': 'Juraj',
  '4-25': 'Marek',
  '4-26': 'Jaroslava',
  '4-27': 'Jaroslav',
  '4-28': 'Vítězslav',
  '4-29': 'Lea',
  '4-30': 'Anastázia',
  // May
  '5-1': 'Žofia',
  '5-2': 'Žigmund',
  '5-3': 'Galina',
  '5-4': 'Florián',
  '5-5': 'Lesana',
  '5-6': 'Hermína',
  '5-7': 'Monika',
  '5-8': 'Ingrida',
  '5-9': 'Roland',
  '5-10': 'Viktória',
  '5-11': 'Blažena',
  '5-12': 'Pankrác',
  '5-13': 'Servác',
  '5-14': 'Bonifác',
  '5-15': 'Žofia',
  '5-16': 'Svetozár',
  '5-17': 'Gizela',
  '5-18': 'Viola',
  '5-19': 'Gertrúda',
  '5-20': 'Bernardín',
  '5-21': 'Zina',
  '5-22': 'Júlia',
  '5-23': 'Želmíra',
  '5-24': 'Ela',
  '5-25': 'Urban',
  '5-26': 'Dušan',
  '5-27': 'Iveta',
  '5-28': 'Vilma',
  '5-29': 'Maximilián',
  '5-30': 'Ferdinand',
  '5-31': 'Petronela',
  // June
  '6-1': 'Žaneta',
  '6-2': 'Xénia',
  '6-3': 'Karolína',
  '6-4': 'Lenka',
  '6-5': 'Laura',
  '6-6': 'Norbert',
  '6-7': 'Róbert',
  '6-8': 'Medard',
  '6-9': 'Stanislava',
  '6-10': 'Margaréta',
  '6-11': 'Antónia',
  '6-12': 'Zlatko',
  '6-13': 'Anton',
  '6-14': 'Vasil',
  '6-15': 'Vít',
  '6-16': 'Blanka',
  '6-17': 'Adolf',
  '6-18': 'Alena',
  '6-19': 'Alfréd',
  '6-20': 'Florentína',
  '6-21': 'Alojz',
  '6-22': 'Paulína',
  '6-23': 'Sidónia',
  '6-24': 'Ján',
  '6-25': 'Tadeáš',
  '6-26': 'Adriána',
  '6-27': 'Ladislav',
  '6-28': 'Beáta',
  '6-29': 'Petra',
  '6-30': 'Melánia',
  // July
  '7-1': 'Diana',
  '7-2': 'Berta',
  '7-3': 'Miloslav',
  '7-4': 'Prokop',
  '7-5': 'Cyril a Metod',
  '7-6': 'Patrícia',
  '7-7': 'Cyprián',
  '7-8': 'Ivan',
  '7-9': 'Lujza',
  '7-10': 'Amália',
  '7-11': 'Milota',
  '7-12': 'Nina',
  '7-13': 'Margita',
  '7-14': 'Kamil',
  '7-15': 'Henrich',
  '7-16': 'Drahomír',
  '7-17': 'Bohuslava',
  '7-18': 'Kamila',
  '7-19': 'Dušana',
  '7-20': 'Iľja',
  '7-21': 'Daniel',
  '7-22': 'Magdaléna',
  '7-23': 'Rastislava',
  '7-24': 'Kinga',
  '7-25': 'Jakub',
  '7-26': 'Anna',
  '7-27': 'Božena',
  '7-28': 'Krištof',
  '7-29': 'Marta',
  '7-30': 'Libuša',
  '7-31': 'Ignác',
  // August
  '8-1': 'Božidara',
  '8-2': 'Gustáv',
  '8-3': 'Bažil',
  '8-4': 'Dominik',
  '8-5': 'Hortenzia',
  '8-6': 'Jozefína',
  '8-7': 'Štefánia',
  '8-8': 'Oskar',
  '8-9': 'Ľubomíra',
  '8-10': 'Vavrinec',
  '8-11': 'Zuzana',
  '8-12': 'Darina',
  '8-13': 'Ľuboslava',
  '8-14': 'Mojmír',
  '8-15': 'Marcela',
  '8-16': 'Leonard',
  '8-17': 'Milica',
  '8-18': 'Elena',
  '8-19': 'Lýdia',
  '8-20': 'Anabela',
  '8-21': 'Jana',
  '8-22': 'Tichomír',
  '8-23': 'Filip',
  '8-24': 'Bartolomej',
  '8-25': 'Ľudovít',
  '8-26': 'Šamuel',
  '8-27': 'Silvia',
  '8-28': 'Augustín',
  '8-29': 'Nikola',
  '8-30': 'Ružena',
  '8-31': 'Nora',
  // September
  '9-1': 'Darina',
  '9-2': 'Konštantín',
  '9-3': 'Belo',
  '9-4': 'Rozália',
  '9-5': 'Regina',
  '9-6': 'Alžbeta',
  '9-7': 'Mariána',
  '9-8': 'Miriama',
  '9-9': 'Ľudmila',
  '9-10': 'Oľga',
  '9-11': 'Bystrík',
  '9-12': 'Mária',
  '9-13': 'Jana',
  '9-14': 'Ľuboš',
  '9-15': 'Jolana',
  '9-16': 'Ľudomil',
  '9-17': 'Olympia',
  '9-18': 'Eugénia',
  '9-19': 'Konštantín',
  '9-20': 'Ľuboslav',
  '9-21': 'Matúš',
  '9-22': 'Móric',
  '9-23': 'Zdenka',
  '9-24': 'Ľuboš',
  '9-25': 'Vladislav',
  '9-26': 'Edita',
  '9-27': 'Cyprián',
  '9-28': 'Václav',
  '9-29': 'Michal',
  '9-30': 'Jarolím',
  // October
  '10-1': 'Arnold',
  '10-2': 'Levoslav',
  '10-3': 'Stela',
  '10-4': 'František',
  '10-5': 'Viera',
  '10-6': 'Natália',
  '10-7': 'Eliška',
  '10-8': 'Brigita',
  '10-9': 'Dionýz',
  '10-10': 'Slavomíra',
  '10-11': 'Valentína',
  '10-12': 'Maximilián',
  '10-13': 'Koloman',
  '10-14': 'Boris',
  '10-15': 'Terézia',
  '10-16': 'Vladimír',
  '10-17': 'Hedviga',
  '10-18': 'Lukáš',
  '10-19': 'Kristián',
  '10-20': 'Vendelín',
  '10-21': 'Uršuľa',
  '10-22': 'Sergej',
  '10-23': 'Alojzia',
  '10-24': 'Kvetoslava',
  '10-25': 'Aurel',
  '10-26': 'Demeter',
  '10-27': 'Sabína',
  '10-28': 'Dobromila',
  '10-29': 'Klára',
  '10-30': 'Šimona',
  '10-31': 'Aurélia',
  // November
  '11-1': 'Denis',
  '11-2': 'Blanka',
  '11-3': 'Hubert',
  '11-4': 'Karol',
  '11-5': 'Imrich',
  '11-6': 'René',
  '11-7': 'Marína',
  '11-8': 'Bohumír',
  '11-9': 'Teodor',
  '11-10': 'Tibor',
  '11-11': 'Martin',
  '11-12': 'Svätopluk',
  '11-13': 'Stanislav',
  '11-14': 'Irma',
  '11-15': 'Leopold',
  '11-16': 'Ľubomír',
  '11-17': 'Klaudia',
  '11-18': 'Eugen',
  '11-19': 'Alžbeta',
  '11-20': 'Félix',
  '11-21': 'Cecília',
  '11-22': 'Klement',
  '11-23': 'Katarína',
  '11-24': 'Emília',
  '11-25': 'Miloslav',
  '11-26': 'Kornel',
  '11-27': 'Milan',
  '11-28': 'Henrieta',
  '11-29': 'Vratko',
  '11-30': 'Ondrej',
  // December
  '12-1': 'Edmund',
  '12-2': 'Bibiána',
  '12-3': 'Oldrich',
  '12-4': 'Barbora',
  '12-5': 'Oto',
  '12-6': 'Mikuláš',
  '12-7': 'Ambróz',
  '12-8': 'Marína',
  '12-9': 'Izabela',
  '12-10': 'Radúz',
  '12-11': 'Hilda',
  '12-12': 'Otília',
  '12-13': 'Lucia',
  '12-14': 'Branislava',
  '12-15': 'Ivica',
  '12-16': 'Albína',
  '12-17': 'Olympia',
  '12-18': 'Sláva',
  '12-19': 'Judita',
  '12-20': 'Dagmara',
  '12-21': 'Bohdan',
  '12-22': 'Adela',
  '12-23': 'Nadežda',
  '12-24': 'Adam a Eva',
  '12-25': 'Vianoce',
  '12-26': 'Štefan',
  '12-27': 'Ján',
  '12-28': 'Nedelia',
  '12-29': 'Milada',
  '12-30': 'Dávid',
  '12-31': 'Silvester',
}

export function getNameday(date: Date): string {
  const key = `${date.getMonth() + 1}-${date.getDate()}`
  return NAMEDAYS[key] ?? ''
}

export function getTomorrowNameday(date: Date): string {
  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return getNameday(tomorrow)
}

// Slovak public holidays (fixed dates)
const SK_HOLIDAYS_FIXED: Record<string, string> = {
  '1-1': 'Deň vzniku SR',
  '1-6': 'Traja králi',
  '5-1': 'Sviatok práce',
  '5-8': 'Deň víťazstva nad fašizmom',
  '7-5': 'Sviatok Cyrila a Metoda',
  '8-29': 'Výročie SNP',
  '9-1': 'Deň Ústavy SR',
  '9-15': 'Deň Panny Márie Sedembolestnej',
  '11-1': 'Sviatok všetkých svätých',
  '11-17': 'Deň boja za slobodu a demokraciu',
  '12-24': 'Štedrý deň',
  '12-25': 'Prvý sviatok vianočný',
  '12-26': 'Druhý sviatok vianočný',
}

// Dynamic Easter calculation (Anonymous Gregorian algorithm)
function getEasterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function getEasterHolidays(year: number): { key: string; name: string; date: Date }[] {
  const easter = getEasterDate(year)
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  const easterMonday = new Date(easter)
  easterMonday.setDate(easter.getDate() + 1)
  return [
    { key: `${goodFriday.getMonth() + 1}-${goodFriday.getDate()}`, name: 'Veľký piatok', date: goodFriday },
    { key: `${easter.getMonth() + 1}-${easter.getDate()}`, name: 'Veľkonočná nedeľa', date: easter },
    { key: `${easterMonday.getMonth() + 1}-${easterMonday.getDate()}`, name: 'Veľkonočný pondelok', date: easterMonday },
  ]
}

function getAllHolidaysForYear(year: number): Record<string, string> {
  const holidays = { ...SK_HOLIDAYS_FIXED }
  for (const eh of getEasterHolidays(year)) {
    holidays[eh.key] = eh.name
  }
  return holidays
}

export function getHoliday(date: Date): string | null {
  const holidays = getAllHolidaysForYear(date.getFullYear())
  const key = `${date.getMonth() + 1}-${date.getDate()}`
  return holidays[key] ?? null
}

export function getNextHoliday(date: Date): { name: string; date: Date; daysUntil: number } {
  return getNextHolidays(date, 1)[0] ?? { name: 'Deň vzniku SR', date: new Date(date.getFullYear() + 1, 0, 1), daysUntil: 365 }
}

export function getNextHolidays(date: Date, count: number): { name: string; date: Date; daysUntil: number }[] {
  const year = date.getFullYear()
  const today = new Date(year, date.getMonth(), date.getDate())
  const all: { name: string; date: Date; daysUntil: number }[] = []

  for (const y of [year, year + 1]) {
    const holidays = getAllHolidaysForYear(y)
    for (const [key, name] of Object.entries(holidays)) {
      const [m, d] = key.split('-').map(Number)
      const hDate = new Date(y, m - 1, d)
      const diff = Math.ceil((hDate.getTime() - today.getTime()) / 86400000)
      if (diff > 0) all.push({ name, date: hDate, daysUntil: diff })
    }
  }

  all.sort((a, b) => a.daysUntil - b.daysUntil)
  return all.slice(0, count)
}
