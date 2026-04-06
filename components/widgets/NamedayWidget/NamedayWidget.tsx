'use client'

import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { sk, enUS } from 'date-fns/locale'
import { getNameday, getTomorrowNameday, getHoliday, getNextHoliday } from '@/lib/namedays'
import { calculateMoonPhase, nextFullMoon } from '@/lib/moon'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((Number(d) - Number(start)) / 86400000)
}

/* ── Slavic namedays (CZ, PL, HU) ── */
function getSlavicNamedays(d: Date): { country: string; flag: string; names: string }[] {
  const m = d.getMonth() + 1
  const day = d.getDate()
  const key = `${m}-${day}`
  const CZ: Record<string, string> = {
    '1-1':'Nový rok','1-2':'Karina','1-3':'Radmila','1-4':'Diana','1-5':'Dalimil','1-6':'Tři králové','1-7':'Vilma','1-8':'Čestmír','1-9':'Vladan','1-10':'Břetislav',
    '1-11':'Bohdana','1-12':'Pravoslav','1-13':'Edita','1-14':'Radovan','1-15':'Alice','1-16':'Ctirad','1-17':'Drahoslav','1-18':'Vladislav','1-19':'Doubravka','1-20':'Ilona',
    '1-21':'Běla','1-22':'Slavomír','1-23':'Zdeněk','1-24':'Milena','1-25':'Miloš','1-26':'Zora','1-27':'Ingrid','1-28':'Otýlie','1-29':'Zdislava','1-30':'Robin','1-31':'Marika',
    '2-1':'Hynek','2-2':'Nela','2-3':'Blažej','2-4':'Jarmila','2-5':'Dobromila','2-6':'Vanda','2-7':'Veronika','2-8':'Milada','2-9':'Apolena','2-10':'Mojmír',
    '2-11':'Božena','2-12':'Slavěna','2-13':'Věnceslav','2-14':'Valentýn','2-15':'Jiřina','2-16':'Ljuba','2-17':'Miloslava','2-18':'Gizela','2-19':'Patrik','2-20':'Oldřich',
    '2-21':'Lenka','2-22':'Petr','2-23':'Svatopluk','2-24':'Matěj','2-25':'Liliana','2-26':'Dorota','2-27':'Alexandr','2-28':'Lumír','2-29':'Horymír',
    '3-1':'Bedřich','3-2':'Anežka','3-3':'Kamil','3-4':'Stela','3-5':'Kazimír','3-6':'Miroslav','3-7':'Tomáš','3-8':'Gabriela','3-9':'Františka','3-10':'Viktorie',
    '3-11':'Anděla','3-12':'Řehoř','3-13':'Růžena','3-14':'Rút,Matylda','3-15':'Ida','3-16':'Elena,Herbert','3-17':'Vlastimil','3-18':'Eduard','3-19':'Josef','3-20':'Světlana',
    '3-21':'Radek','3-22':'Leona','3-23':'Ivona','3-24':'Gabriel','3-25':'Marián','3-26':'Emanuel','3-27':'Dita','3-28':'Soňa','3-29':'Taťána','3-30':'Arnošt','3-31':'Kvido',
    '4-1':'Hugo','4-2':'Erika','4-3':'Richard','4-4':'Ivana','4-5':'Miroslava','4-6':'Vendula','4-7':'Heřman,Hermína','4-8':'Ema','4-9':'Dušan','4-10':'Darja',
    '4-11':'Izabela','4-12':'Julius','4-13':'Aleš','4-14':'Vincenc','4-15':'Anastázie','4-16':'Irena','4-17':'Rudolf','4-18':'Valérie','4-19':'Rostislav','4-20':'Marcela',
    '4-21':'Alexandra','4-22':'Evžénie','4-23':'Vojtěch','4-24':'Jiří','4-25':'Marek','4-26':'Oto','4-27':'Jaroslav','4-28':'Vlastislav','4-29':'Robert','4-30':'Blahoslav',
    '5-1':'Svátek práce','5-2':'Zikmund','5-3':'Alexej','5-4':'Květoslav','5-5':'Klaudie','5-6':'Radoslav','5-7':'Stanislav','5-8':'Den vítězství','5-9':'Ctibor','5-10':'Blažena',
    '5-11':'Svatava','5-12':'Pankrác','5-13':'Servác','5-14':'Bonifác','5-15':'Žofie','5-16':'Přemysl','5-17':'Aneta','5-18':'Nataša','5-19':'Ivo','5-20':'Zbyšek',
    '5-21':'Monika','5-22':'Emil','5-23':'Vladimír','5-24':'Jana','5-25':'Viola','5-26':'Filip','5-27':'Valdemar','5-28':'Vilém','5-29':'Maxmilián','5-30':'Ferdinand','5-31':'Kamila',
    '6-1':'Laura','6-2':'Jarmil','6-3':'Tamara','6-4':'Dalibor','6-5':'Dobroslav','6-6':'Norbert','6-7':'Iveta,Slavoj','6-8':'Medard','6-9':'Stanislava','6-10':'Gita',
    '6-11':'Bruno','6-12':'Antonie','6-13':'Antonín','6-14':'Roland','6-15':'Vít','6-16':'Zbyněk','6-17':'Adolf','6-18':'Milan','6-19':'Leoš','6-20':'Květa',
    '6-21':'Alois','6-22':'Pavla','6-23':'Zdeňka','6-24':'Jan','6-25':'Ivan','6-26':'Adriana','6-27':'Ladislav','6-28':'Lubomír','6-29':'Petr a Pavel','6-30':'Šárka',
    '7-1':'Jaroslav','7-2':'Patricie','7-3':'Radomír','7-4':'Prokop','7-5':'Cyril a Metoděj','7-6':'Jan Hus','7-7':'Bohuslava','7-8':'Edgar','7-9':'Drahoslava','7-10':'Libuše',
    '7-11':'Olga','7-12':'Bořek','7-13':'Markéta','7-14':'Karolína','7-15':'Jindřich','7-16':'Luboš','7-17':'Martina','7-18':'Drahomíra','7-19':'Čeněk','7-20':'Ilja',
    '7-21':'Vítězslav','7-22':'Magdaléna','7-23':'Libor','7-24':'Kristýna','7-25':'Jakub','7-26':'Anna','7-27':'Věroslav','7-28':'Viktor','7-29':'Marta','7-30':'Bořivoj','7-31':'Ignác',
    '8-1':'Oskar','8-2':'Gustav','8-3':'Rút','8-4':'Dominik','8-5':'Kristián','8-6':'Oldřiška','8-7':'Lešek','8-8':'Soběslav','8-9':'Roman','8-10':'Vavřinec',
    '8-11':'Zuzana','8-12':'Klára','8-13':'Alžběta','8-14':'Mojmír','8-15':'Hana','8-16':'Jáchym','8-17':'Petra','8-18':'Helena','8-19':'Ludvík','8-20':'Bernard',
    '8-21':'Johana','8-22':'Bohuslav','8-23':'Sandra','8-24':'Bartoloměj','8-25':'Radim','8-26':'Luděk','8-27':'Šimona','8-28':'Augustýn','8-29':'Evelína','8-30':'Vladěna','8-31':'Pavel',
    '9-1':'Linda','9-2':'Adéla','9-3':'Bronislav','9-4':'Jindřiška','9-5':'Boris','9-6':'Boleslav','9-7':'Regína','9-8':'Mariana','9-9':'Daniela','9-10':'Irma',
    '9-11':'Denisa','9-12':'Marie','9-13':'Lubor','9-14':'Radka','9-15':'Jolana','9-16':'Ludmila','9-17':'Naděžda','9-18':'Kryštof','9-19':'Werner','9-20':'Oleg',
    '9-21':'Matouš','9-22':'Darina','9-23':'Bořivoj','9-24':'Jaromír','9-25':'Zlata','9-26':'Andrea','9-27':'Jonáš','9-28':'Václav','9-29':'Michal','9-30':'Jeroným',
    '10-1':'Igor','10-2':'Olivie','10-3':'Bohumil','10-4':'František','10-5':'Eliška','10-6':'Hanuš','10-7':'Justýna','10-8':'Věra','10-9':'Štefan','10-10':'Marina',
    '10-11':'Andrej','10-12':'Marcel','10-13':'Renata','10-14':'Agáta','10-15':'Tereza','10-16':'Havel','10-17':'Hedvika','10-18':'Lukáš','10-19':'Michaela','10-20':'Vendelín',
    '10-21':'Brigita','10-22':'Sabina','10-23':'Teodor','10-24':'Nina','10-25':'Beáta','10-26':'Erik','10-27':'Šarlota','10-28':'Státní svátek','10-29':'Silvie','10-30':'Tadeáš','10-31':'Štěpánka',
    '11-1':'Felix','11-2':'Dušičky','11-3':'Hubert','11-4':'Karel','11-5':'Miriam','11-6':'Liběna','11-7':'Szaskie','11-8':'Bohumír','11-9':'Bohdan','11-10':'Evžen',
    '11-11':'Martin','11-12':'Renata','11-13':'Tibor','11-14':'Sáva','11-15':'Leopold','11-16':'Otmar','11-17':'Mahulena','11-18':'Romana','11-19':'Alžběta','11-20':'Nikola',
    '11-21':'Albert','11-22':'Cecílie','11-23':'Klement','11-24':'Emílie','11-25':'Kateřina','11-26':'Artur','11-27':'Xenie','11-28':'René','11-29':'Zina','11-30':'Ondřej',
    '12-1':'Iva','12-2':'Blanka','12-3':'Svatoslav','12-4':'Barbora','12-5':'Jitka','12-6':'Mikuláš','12-7':'Ambrož','12-8':'Květoslava','12-9':'Vratislav','12-10':'Julie',
    '12-11':'Dana','12-12':'Daniela','12-13':'Lucie','12-14':'Lýdie','12-15':'Radan','12-16':'Albína','12-17':'Daniel','12-18':'Miloslav','12-19':'Ester','12-20':'Dagmar',
    '12-21':'Tomáš','12-22':'Štefan','12-23':'Vlasta','12-24':'Adam a Eva','12-25':'Boží hod','12-26':'Štěpán','12-27':'Žaneta','12-28':'Bohumila','12-29':'Judita','12-30':'David','12-31':'Silvestr',
  }
  const PL: Record<string, string> = {
    '1-1':'Mieczysław,Mieszko','1-2':'Izydor,Bazyli','1-3':'Genowefa,Daniel','1-4':'Tytus,Anzelm','1-5':'Edward,Szymon','1-6':'Trzech Króli',
    '1-7':'Juliana,Lucjan','1-8':'Seweryn','1-9':'Adrian,Marcelina','1-10':'Danuta,Wilhelm','1-11':'Honorata','1-12':'Arkadiusz',
    '1-13':'Bogumił','1-14':'Nina,Feliks','1-15':'Paweł,Arnold','1-16':'Marceli,Włodzimierz','1-17':'Antoni,Jan','1-18':'Małgorzata,Piotr',
    '1-19':'Henryk,Marta','1-20':'Fabian,Sebastian','1-21':'Agnieszka,Jarosław','1-22':'Wincenty,Anastazy','1-23':'Ildefons,Rajmund','1-24':'Felicja,Rafał',
    '1-25':'Paweł','1-26':'Tymoteusz,Michał','1-27':'Angela,Jerzy','1-28':'Walezy,Radomir','1-29':'Zdzisław,Franciszek','1-30':'Maciej,Martyna','1-31':'Marcela,Jan',
    '2-1':'Ignacy,Brygida','2-2':'Maria,Miłosz','2-3':'Błażej,Oskar','2-4':'Andrzej,Weronika','2-5':'Agata,Adelaide','2-6':'Dorota,Bogdan',
    '2-7':'Ryszard,Romuald','2-8':'Hieronim,Sebastian','2-9':'Apolonia','2-10':'Scholastyka,Jacek',
    '3-1':'Albin,Antonina','3-2':'Helena,Halszka','3-3':'Maryna,Kunegunda','3-4':'Kazimierz,Lucjusz','3-5':'Adrian,Fryderyk','3-6':'Róża,Jordanka',
    '3-19':'Józef','3-20':'Klaudia,Aleksandra','3-21':'Benedykt','3-25':'Maria',
    '3-30':'Amelia,Leonard','3-31':'Beniamin,Kamil',
    '4-1':'Hugo,Irena','4-2':'Franciszek','4-3':'Ryszard','4-4':'Izydor,Benedykt','4-5':'Irena,Wincenty','4-6':'Celestyn,Wilhelm','4-7':'Herman,Rufin','4-8':'Julia,Wanda','4-9':'Dariusz','4-10':'Michał,Danuta',
    '4-11':'Leon,Filip','4-12':'Julius','4-13':'Ida,Przemek','4-14':'Walerian','4-15':'Wacław,Anastazja','4-16':'Cecylia','4-17':'Rudolf,Robert','4-18':'Bogusław','4-19':'Leon','4-20':'Czesław,Agnieszka',
    '4-21':'Anzelm','4-22':'Łukasz','4-23':'Wojciech,Jerzy','4-24':'Fidelis','4-25':'Marek','4-26':'Marzena,Klaudia','4-27':'Zyta,Piotr','4-28':'Waleria,Ludwik','4-29':'Katarzyna,Robert','4-30':'Katarzyna,Szymon',
    '5-1':'Józef,Filip','5-2':'Zygmunt,Atanazy','5-3':'Mariola','5-4':'Florian,Monika','5-5':'Irena','5-6':'Jan,Filippa','5-7':'Gizela','5-8':'Stanisław','5-9':'Bożena,Gracja','5-10':'Antonina,Jan',
    '5-11':'Franciszek,Joanna','5-12':'Dominik,Pankracy','5-13':'Serwacy,Maciej','5-14':'Bonifacy','5-15':'Zofia,Natasza','5-16':'Andrzej,Piotr','5-17':'Pascal','5-18':'Jan,Eric','5-19':'Piotr,Urban','5-20':'Bernardyn',
    '5-21':'Tymoteusz,Wiktor','5-22':'Emilia,Rita','5-23':'Iwona,Dezydery','5-24':'Jan','5-25':'Grzegorz','5-26':'Filip,Jan','5-27':'Augustyn','5-28':'Wilhelm','5-29':'Maksymilian','5-30':'Joanna,Ferdynand','5-31':'Angela,Petronela',
    '6-1':'Jakub,Angelika','6-2':'Marianna,Eugeniusz','6-3':'Leszek,Tamara','6-4':'Kwiryn','6-5':'Bonifacy','6-6':'Norbert','6-7':'Robert,Andrzej','6-8':'Medard','6-9':'Felicjan','6-10':'Bogumił',
    '6-11':'Barnaba','6-12':'Jan,Onufry','6-13':'Antoni','6-14':'Bazyli','6-15':'Wit,Joanna','6-16':'Benon,Alina','6-17':'Laura,Adolf','6-18':'Marek,Elżbieta','6-19':'Gerwazy,Protazy','6-20':'Bogna,Florentyn',
    '6-21':'Alojzy,Alicja','6-22':'Paulin,Achacy','6-23':'Wanda','6-24':'Jan','6-25':'Łucja,Wilhelm','6-26':'Jan,Paulin','6-27':'Władysław','6-28':'Leon,Ireneusz','6-29':'Piotr,Paweł','6-30':'Lucyna,Emil',
    '7-1':'Halina,Teodor','7-2':'Bernardyn,Otto','7-3':'Tomasz','7-4':'Zofia,Ulryk','7-5':'Karolina,Antoni','7-6':'Dominika,Maria','7-7':'Cyryl,Metody','7-8':'Edgar,Eugeniusz','7-9':'Weronika','7-10':'Sylwia,Weronika',
    '7-11':'Benedykt,Olga','7-12':'Jan,Brunon','7-13':'Szymon,Henryk','7-14':'Kamil,Bonawentura','7-15':'Anna,Henryk','7-16':'Fulko,Stanisław','7-17':'Aleksy,Bogdan','7-18':'Kamil','7-19':'Wincenty','7-20':'Czesław',
    '7-21':'Wiktor,Daniel','7-22':'Maria Magdalena','7-23':'Brygida','7-24':'Krystyna,Kinga','7-25':'Jakub,Krzysztof','7-26':'Anna,Joachim','7-27':'Natalia,Celes','7-28':'Wiktor,Apolinary','7-29':'Marta','7-30':'Piotr,Julita','7-31':'Ignacy,Helena',
    '8-1':'Piotr,Anzelm','8-2':'Gustaw,Euzebio','8-3':'Szymon,August','8-4':'Dominik,Jan','8-5':'Kazimiera,Maria','8-6':'Józefat','8-7':'Albert,Kajet','8-8':'Cyriak,Leon','8-9':'Roman,Felicjan','8-10':'Wawrzyniec,Diomedes',
    '8-11':'Zuzanna,Klara','8-12':'Klara,Lech','8-13':'Hippolit,Kacper','8-14':'Maksymilian','8-15':'Maria,Wniebowzięcie','8-16':'Joachim,Roch','8-17':'Jacek','8-18':'Helena,Ilona','8-19':'Jan,Bolesław','8-20':'Bernard,Sabina',
    '8-21':'Jędrzej','8-22':'Marta,Cezary','8-23':'Rościsław,Filip','8-24':'Bartłomiej','8-25':'Ludwik,Józef','8-26':'Natalia','8-27':'Cezary,Józef','8-28':'Augustyn,Jan','8-29':'Jan','8-30':'Szczęsny','8-31':'Rajmund,Roman',
    '9-1':'Bronisław,Idzi','9-2':'Stefan,Julian','9-3':'Izydora,Gracjan','9-4':'Rozalia','9-5':'Wawrzyniec,Dorota','9-6':'Beata,Eugeniusz','9-7':'Regina','9-8':'Maria','9-9':'Piotr,Sergiusz','9-10':'Mikołaj,Łukasz',
    '9-11':'Jacek,Proto','9-12':'Gwidon,Sylwia','9-13':'Jan,Filip','9-14':'Notburga','9-15':'Maria','9-16':'Edyta,Kornelius','9-17':'Justyna,Albert','9-18':'Irena,Józef','9-19':'Jenaro,Emil','9-20':'Eustachy',
    '9-21':'Mateusz','9-22':'Jonasz,Maurycy','9-23':'Tekla,Linus','9-24':'Gerard,Teodor','9-25':'Sławomir,Władysław','9-26':'Justyna,Cyprian','9-27':'Wincenty','9-28':'Wacław','9-29':'Michał,Rafael','9-30':'Hieronim,Zofia',
    '10-1':'Remigius,Henryk','10-2':'Anioł Stróż','10-3':'Gerard','10-4':'Franciszek','10-5':'Faustyna','10-6':'Brunon,Artur','10-7':'Marcos,Justyn','10-8':'Brygida,Wiera','10-9':'Dionizy','10-10':'Franciszek,Daniel',
    '10-11':'Aldona','10-12':'Wiktor,Edwin','10-13':'Edward,Gerald','10-14':'Brunon','10-15':'Teresa','10-16':'Jadwiga,Henryk','10-17':'Ignacy','10-18':'Łukasz','10-19':'Jan,Piotr','10-20':'Irena,Kleopatra',
    '10-21':'Urszula,Celina','10-22':'Filip,Marek','10-23':'Jan,Roman','10-24':'Rafał,Marek','10-25':'Daria,Krispin','10-26':'Lucja,Ewaryst','10-27':'Sabina,Wiktoria','10-28':'Szymon,Juda','10-29':'Narcyz','10-30':'Zenobia,Alfonsa','10-31':'Ludwika,Wolfgang',
    '11-1':'Wszystkich Świętych','11-2':'Zaduszki','11-3':'Hubert,Sylwia','11-4':'Karol','11-5':'Sławomir,Elżbieta','11-6':'Leon,Feliks','11-7':'Marcin,Engelbert','11-8':'Sławomir','11-9':'Teodor','11-10':'Leon,Andrzej',
    '11-11':'Marcin','11-12':'Renata,Benedykt','11-13':'Benedykt,Stanisław','11-14':'Brynhilda,Albert','11-15':'Leopold,Albert','11-16':'Edmund,Otmar','11-17':'Grzegorz','11-18':'Roman,Odo','11-19':'Elżbieta,Marek','11-20':'Edmund',
    '11-21':'Janusz','11-22':'Cecylia','11-23':'Feliks,Klemens','11-24':'Jan,Emma','11-25':'Katarzyna','11-26':'Leonard,Sylwester','11-27':'Maksymilian','11-28':'Zdzisław,Stefan','11-29':'Saturnin','11-30':'Andrzej',
    '12-1':'Eligiusz,Natalia','12-2':'Balbina,Bibiana','12-3':'Franciszek','12-4':'Barbara','12-5':'Sabas,Kryspin','12-6':'Mikołaj','12-7':'Ambroży','12-8':'Maria','12-9':'Wiesław,Leokadia','12-10':'Julia,Danuta',
    '12-11':'Waldemar,Damaz','12-12':'Aleksandra,Jana','12-13':'Łucja','12-14':'Jan,Maria','12-15':'Nina,Albina','12-16':'Albina,Zdzisław','12-17':'Łazarz,Joanna','12-18':'Bogusław','12-19':'Bożena,Urban','12-20':'Bogumił,Daniel',
    '12-21':'Tomasz','12-22':'Zenon','12-23':'Jan,Sławomira','12-24':'Adam,Ewa','12-25':'Boże Narodzenie','12-26':'Szczepan,Stefan','12-27':'Jan','12-28':'Innocenty','12-29':'Dawid,Tomasz','12-30':'Dawid,Roger','12-31':'Sylwester',
  }
  const HU: Record<string, string> = {
    '1-1':'Fruzsina','1-2':'Ábel','1-3':'Genovéva,Benjámin','1-4':'Titusz,Leona','1-5':'Simon','1-6':'Boldizsár',
    '1-7':'Attila,Ramóna','1-8':'Gyöngyvér','1-9':'Marcell','1-10':'Melánia','1-11':'Ágota','1-12':'Ernő',
    '1-13':'Veronika','1-14':'Bódog','1-15':'Loránd,Lóránt','1-16':'Gusztáv','1-17':'Antal,Antónia','1-18':'Piroska',
    '1-19':'Sára,Márió','1-20':'Fábián,Sebestyén','1-21':'Ágnes','1-22':'Vince,Artúr','1-23':'Zelma,Rajmund','1-24':'Timót',
    '1-25':'Pál','1-26':'Vanda,Paula','1-27':'Angelika','1-28':'Károly,Karola','1-29':'Adél','1-30':'Martina,Gerda','1-31':'Marcella',
    '2-1':'Ignác','2-2':'Karolina,Aida','2-3':'Balázs','2-4':'Ráhel,Csenge','2-5':'Ágota,Ingrid','2-6':'Dorottya,Dóra',
    '2-7':'Tódor,Rómeó','2-8':'Aranka','2-9':'Abigél,Alex','2-10':'Elvira',
    '3-1':'Albin','3-2':'Lujza','3-3':'Kornélia','3-4':'Kázmér','3-5':'Adorján,Adrián','3-6':'Leonóra,Inez',
    '3-19':'József','3-20':'Klaudia','3-21':'Benedek','3-25':'Gyöngyi,Irész',
    '3-30':'Zalán','3-31':'Árpád',
    '4-1':'Hugó','4-2':'Áron','4-3':'Buda,Richárd','4-4':'Izidor','4-5':'Vince','4-6':'Vilmos,Bíborka','4-7':'Herman','4-8':'Dénes','4-9':'Erhard,Dési','4-10':'Zsolt',
    '4-11':'Leó,Szaniszló','4-12':'Gyula','4-13':'Ida','4-14':'Tibor','4-15':'Anastázia,Tas','4-16':'Csongor','4-17':'Rudolf,Rezső','4-18':'Andrea,Ilma','4-19':'Emma','4-20':'Tivadar',
    '4-21':'Anzelm','4-22':'Csilla,Noémi','4-23':'Béla','4-24':'György,Csaba','4-25':'Márk','4-26':'Ervin','4-27':'Zita','4-28':'Valéria','4-29':'Péter','4-30':'Katalin,Kitti',
    '5-1':'Fülöp,Jakab','5-2':'Zsigmond','5-3':'Tímea,Irma','5-4':'Mónika,Flórián','5-5':'Györgyi','5-6':'Ivett,Frida','5-7':'Gizella','5-8':'Mihály','5-9':'Gergely','5-10':'Ármin,Pálma',
    '5-11':'Ferenc','5-12':'Pongrác','5-13':'Szervác,Imola','5-14':'Bonifác','5-15':'Zsófia,Szonja','5-16':'Mózes,Botond','5-17':'Paszkál','5-18':'Erik,Alexandra','5-19':'Ivó,Milán','5-20':'Bernát,Felícia',
    '5-21':'Konstantin','5-22':'Júlia,Rita','5-23':'Dezső','5-24':'Eszter,Eliza','5-25':'Orbán','5-26':'Fülöp,Evelin','5-27':'Hella','5-28':'Emil,Csanád','5-29':'Magdolna','5-30':'Janka,Zsanett','5-31':'Angéla,Petronella',
    '6-1':'Tünde','6-2':'Anita,Kármen','6-3':'Klotild','6-4':'Bulcsú','6-5':'Fatime','6-6':'Norbert','6-7':'Róbert','6-8':'Medárd','6-9':'Félix','6-10':'Margit,Gréta',
    '6-11':'Barnabás','6-12':'Villő','6-13':'Antal,Anett','6-14':'Vazul','6-15':'Jolán,Vid','6-16':'Jusztin','6-17':'Laura,Alida','6-18':'Arnold,Levente','6-19':'Gyárfás','6-20':'Rafael',
    '6-21':'Alajos,Leila','6-22':'Paulina','6-23':'Zoltán','6-24':'Iván','6-25':'Vilmos','6-26':'János,Pál','6-27':'László','6-28':'Irén,Levente','6-29':'Péter,Pál','6-30':'Pál',
    '7-1':'Tihamér,Annamária','7-2':'Ottó','7-3':'Kornél,Soma','7-4':'Ulrich,Imre','7-5':'Emese,Sarolta','7-6':'Csaba','7-7':'Apollónia','7-8':'Ellák','7-9':'Lukrécia','7-10':'Amália',
    '7-11':'Nóra,Lili','7-12':'Izabella,Dalma','7-13':'Jenő','7-14':'Örs,Stella','7-15':'Henrik,Roland','7-16':'Valter','7-17':'Endre,Elek','7-18':'Frigyes','7-19':'Emília','7-20':'Illés',
    '7-21':'Dániel,Daniella','7-22':'Mária Magdolna','7-23':'Lenke','7-24':'Kinga,Kincső','7-25':'Jakab,Kristóf','7-26':'Anna,Anikó','7-27':'Lilla','7-28':'Szabolcs','7-29':'Márta,Flóra','7-30':'Judit,Xénia','7-31':'Oszkár',
    '8-1':'Boglárka','8-2':'Lehel','8-3':'Hermina','8-4':'Domonkos,Dominika','8-5':'Krisztina','8-6':'Berta,Bertalan','8-7':'Ibolya','8-8':'László','8-9':'Emőd','8-10':'Lőrinc',
    '8-11':'Zsuzsanna,Tiborc','8-12':'Klára','8-13':'Ipoly,Hilda','8-14':'Marcell','8-15':'Mária','8-16':'Ábrahám','8-17':'Jácint','8-18':'Ilona','8-19':'Huba','8-20':'István',
    '8-21':'Sámuel,Hajna','8-22':'Menyhért,Mirjam','8-23':'Bence','8-24':'Bertalan','8-25':'Lajos,Patrícia','8-26':'Izsó','8-27':'Gáspár','8-28':'Ágoston','8-29':'Beatrix,Erna','8-30':'Rózsa','8-31':'Bella,Erika',
    '9-1':'Egyed,Egon','9-2':'Rebeka,Dorina','9-3':'Hilda,Gergely','9-4':'Rozália','9-5':'Viktor,Lőrinc','9-6':'Zakariás','9-7':'Regina','9-8':'Mária','9-9':'Ádám','9-10':'Nikolett,Hunor',
    '9-11':'Teodóra','9-12':'Mária','9-13':'Kornél','9-14':'Szeréna,Roxána','9-15':'Enikő,Melitta','9-16':'Edit','9-17':'Zsófia,Hildegárd','9-18':'Diána,Irma','9-19':'Vilhelmina','9-20':'Friderika',
    '9-21':'Máté,Mirella','9-22':'Móric','9-23':'Tekla','9-24':'Gellért,Mercédesz','9-25':'Eufrozina,Kende','9-26':'Jusztina','9-27':'Adalbert','9-28':'Vencel','9-29':'Mihály','9-30':'Jeromos',
    '10-1':'Malvin','10-2':'Petra','10-3':'Helga','10-4':'Ferenc','10-5':'Aurél','10-6':'Brúnó,Renáta','10-7':'Amália','10-8':'Koppány','10-9':'Dénes','10-10':'Gedeon',
    '10-11':'Brigitta','10-12':'Miksa','10-13':'Ede,Kálmán','10-14':'Helén','10-15':'Teréz','10-16':'Gál,Hedvig','10-17':'Ignác','10-18':'Lukács','10-19':'Nándor','10-20':'Vendel',
    '10-21':'Orsolya','10-22':'Előd','10-23':'Gyöngyi,Nemzeti ünnep','10-24':'Salamon','10-25':'Blanka,Bianka','10-26':'Dömötör,Demeter','10-27':'Szabina','10-28':'Simon,Szimóna','10-29':'Nárcisz','10-30':'Alfonz','10-31':'Farkas',
    '11-1':'Marianna,Mindenszentek','11-2':'Viktor','11-3':'Győző','11-4':'Károly,Karola','11-5':'Imre','11-6':'Lénárd','11-7':'Rezső','11-8':'Zsombor','11-9':'Tivadar','11-10':'Réka',
    '11-11':'Márton','11-12':'Jónás,Renátó','11-13':'Szilvia','11-14':'Aliz','11-15':'Albert,Leopold','11-16':'Ödön,Gertrúd','11-17':'Hortenzia,Gergő','11-18':'Jenő','11-19':'Erzsébet','11-20':'Jolán',
    '11-21':'Olivér','11-22':'Cecília','11-23':'Kelemen,Kolos','11-24':'Emma','11-25':'Katalin','11-26':'Virgil,Virág','11-27':'Virgil','11-28':'Stefánia','11-29':'Taksony','11-30':'András,Andor',
    '12-1':'Elza','12-2':'Melinda,Vivien','12-3':'Ferenc','12-4':'Borbála','12-5':'Vilma','12-6':'Miklós','12-7':'Ambrus','12-8':'Mária','12-9':'Natália','12-10':'Judit',
    '12-11':'Árpád','12-12':'Gabriella','12-13':'Luca,Otília','12-14':'Szilárda','12-15':'Valér','12-16':'Etelka,Aletta','12-17':'Lázár,Olimpia','12-18':'Auguszta','12-19':'Viola','12-20':'Teofil',
    '12-21':'Tamás','12-22':'Zénó','12-23':'Viktória','12-24':'Ádám,Éva','12-25':'Karácsony','12-26':'István','12-27':'János','12-28':'Kamilla','12-29':'Tamás,Dávid','12-30':'Dávid','12-31':'Szilveszter',
  }
  const AT: Record<string, string> = {
    '1-1':'Neujahr,Maria','1-2':'Basil','1-3':'Genoveva','1-6':'Heilige Drei Könige','1-7':'Valentin','1-8':'Severin','1-13':'Hilarius','1-17':'Anton','1-18':'Priszka',
    '1-19':'Sara','1-20':'Fabian,Sebastian','1-21':'Agnes,Ines','1-22':'Vinzenz','1-24':'Franz','1-25':'Paulus','1-26':'Timotheus','1-28':'Thomas','1-30':'Martina','1-31':'Maria',
    '2-1':'Brigitte','2-2':'Lichtmess,Maria','2-3':'Blasius','2-4':'Veronika','2-5':'Agatha','2-6':'Dorothea','2-7':'Richard','2-8':'Hieronymus','2-9':'Apollonia','2-10':'Scholastika',
    '2-11':'Maria Lourdes','2-14':'Valentin','2-20':'Eleutherius','2-22':'Petrus','2-24':'Matthias','2-28':'Roman',
    '3-3':'Kunigunde','3-4':'Kasimir','3-7':'Thomas','3-8':'Johannes','3-9':'Franziska','3-12':'Gregor','3-17':'Patrick','3-19':'Josef','3-20':'Claudia','3-21':'Benedikt',
    '3-25':'Maria Verkündigung','3-30':'Amadeus','3-31':'Benjamin',
    '4-3':'Richard','4-4':'Isidor','4-5':'Irene','4-6':'Wilhelm,Cölestin','4-7':'Hermann','4-15':'Anastasia','4-17':'Rudolf','4-21':'Anselm','4-23':'Georg','4-24':'Georg','4-25':'Markus','4-29':'Katharina','4-30':'Pius',
    '5-1':'Josef,Staatsfeiertag','5-4':'Florian','5-6':'Gotthard','5-8':'Stanislaus','5-12':'Pankraz','5-13':'Servaz','5-14':'Bonifaz','5-15':'Sophie','5-19':'Ivo','5-25':'Gregor','5-26':'Filip','5-29':'Maximilian',
    '6-1':'Justin','6-2':'Erasmus','6-5':'Bonifaz','6-6':'Norbert','6-8':'Medard','6-9':'Ephrem','6-11':'Barnabas','6-13':'Antonius','6-15':'Veit','6-21':'Alois','6-24':'Johannes','6-27':'Ladislaus','6-29':'Peter und Paul',
    '7-2':'Maria Heimsuchung','7-4':'Ulrich','7-11':'Benedikt','7-15':'Heinrich,Margarethe','7-17':'Alexius','7-22':'Maria Magdalena','7-23':'Birgitta','7-24':'Christoph','7-25':'Jakobus','7-26':'Anna,Joachim','7-31':'Ignatius',
    '8-4':'Dominikus','8-10':'Laurenz','8-11':'Klara','8-14':'Maximilian','8-15':'Maria Himmelfahrt','8-16':'Roch','8-20':'Bernhard','8-24':'Bartholomäus','8-28':'Augustinus','8-29':'Johannes',
    '9-1':'Verena','9-8':'Maria Geburt','9-13':'Notburga','9-14':'Kreuzerhöhung','9-17':'Hildegard','9-21':'Matthäus','9-27':'Vinzenz','9-28':'Wenzel','9-29':'Michael','9-30':'Hieronymus',
    '10-1':'Theresia','10-4':'Franz','10-7':'Rosenkranz','10-15':'Theresia','10-16':'Gallus,Hedwig','10-18':'Lukas','10-21':'Ursula','10-26':'Nationalfeiertag','10-28':'Simon,Juda',
    '11-1':'Allerheiligen','11-2':'Allerseelen','11-3':'Hubert','11-4':'Karl','11-5':'Imrich','11-6':'Leonard','11-11':'Martin','11-15':'Leopold','11-17':'Elisabeth','11-19':'Elisabeth','11-22':'Cäcilia','11-23':'Klemens','11-25':'Katharina','11-30':'Andreas',
    '12-4':'Barbara','12-6':'Nikolaus','12-7':'Ambrosius','12-8':'Maria Empfängnis','12-13':'Luzia','12-21':'Thomas','12-24':'Adam,Eva,Heiligabend','12-25':'Weihnachten','12-26':'Stephan','12-27':'Johannes','12-31':'Silvester',
  }
  const HR: Record<string, string> = {
    '1-1':'Marija','1-2':'Bazilije,Grgur','1-3':'Genoveva','1-4':'Tit,Rigobert','1-5':'Šimun','1-6':'Gašpar,Melkior,Baltazar',
    '1-7':'Rajmund,Lucijan','1-8':'Severin','1-9':'Julijan','1-10':'Doroteja','1-11':'Pavao','1-12':'Tatjana',
    '1-13':'Veronika,Hilari','1-14':'Feliks','1-15':'Pavel','1-16':'Marcel','1-17':'Ante,Antun','1-18':'Margareta,Priska',
    '1-19':'Suzana,Marta','1-20':'Fabijan,Sebastijan','1-21':'Agneza,Ines','1-22':'Vjenceslav','1-23':'Rajmund','1-24':'Franjo',
    '1-25':'Pavao','1-26':'Timotej,Tit','1-27':'Angela,Đuro','1-28':'Toma','1-29':'Franjo','1-30':'Martina','1-31':'Ivan,Marcela',
    '2-1':'Brigita','2-2':'Marija','2-3':'Blaž','2-4':'Andreja,Veronika','2-5':'Agata','2-6':'Pavao,Doroteja',
    '2-7':'Rihard,Romuald','2-8':'Jeronim','2-9':'Apolonija','2-10':'Skolastika',
    '2-14':'Valentin,Valentina','2-22':'Petar','2-24':'Matija','2-28':'Roman',
    '3-1':'Albin','3-3':'Kunigunda','3-4':'Kazimir','3-7':'Toma','3-8':'Ivan','3-9':'Franciska,Kata',
    '3-10':'Viktorija','3-12':'Grgur','3-17':'Patrik','3-19':'Josip','3-20':'Klaudija','3-21':'Benedikt',
    '3-25':'Blagovijest','3-30':'Amadej','3-31':'Benjamin',
    '4-1':'Hugo','4-2':'Franjo','4-4':'Izidor','4-5':'Irena,Vjenceslav','4-7':'Ivan','4-8':'Julija',
    '4-9':'Dušan','4-10':'Danijel','4-11':'Stanislav','4-13':'Martin','4-14':'Valerija','4-16':'Bernadeta',
    '4-17':'Rudolf','4-18':'Valerija','4-20':'Marcel','4-21':'Anzelmo','4-22':'Leonida','4-23':'Vojtjeh,Đuro',
    '4-24':'Juraj','4-25':'Marko','4-27':'Zita','4-28':'Valeria,Petar','4-29':'Katarina','4-30':'Pio',
    '5-1':'Josip','5-2':'Atanazij','5-3':'Filip,Jakov','5-4':'Florijan','5-6':'Dominik','5-7':'Gizela',
    '5-10':'Ivan','5-12':'Leopold','5-13':'Fatimska Gospa','5-15':'Izidor','5-16':'Ivan',
    '5-20':'Bernardin','5-22':'Julija','5-23':'Desiré','5-25':'Grgur,Beda','5-26':'Filip',
    '5-30':'Ivana,Ferdinand','5-31':'Petra',
    '6-1':'Justin','6-3':'Karlo','6-5':'Bonifacije','6-6':'Norbert','6-8':'Medard','6-9':'Efrem',
    '6-11':'Barnaba','6-13':'Ante,Antun','6-15':'Vid','6-21':'Alojzije','6-22':'Paulin,Toma',
    '6-24':'Ivan','6-27':'Ladislav','6-29':'Petar,Pavao','6-30':'Mirko',
  }
  const SI: Record<string, string> = {
    '1-1':'Novo leto','1-2':'Bazilij','1-3':'Genovefa','1-5':'Šimona','1-6':'Gašper,Miha,Baltazar',
    '1-7':'Rajmond','1-8':'Severin','1-9':'Julijan','1-10':'Gregor','1-11':'Honorat',
    '1-12':'Arkadij','1-13':'Veronika','1-14':'Feliks','1-15':'Pavel','1-16':'Marcel',
    '1-17':'Anton','1-18':'Margareta','1-19':'Sara,Mario','1-20':'Fabijan,Sebastijan',
    '1-21':'Neža,Ines','1-22':'Vincencij','1-23':'Rajmond','1-24':'Frančišek',
    '1-25':'Pavel','1-26':'Timotej','1-27':'Angela','1-28':'Tomaž','1-29':'Valerij',
    '1-30':'Martina','1-31':'Ivan,Marcela',
    '2-1':'Brigita','2-2':'Svečnica','2-3':'Blaž','2-5':'Agata','2-6':'Doroteja',
    '2-7':'Rihard','2-8':'Jeronim','2-9':'Apolonija','2-10':'Šolastika',
    '2-14':'Valentin,Valentina','2-22':'Peter','2-24':'Matija','2-28':'Roman',
    '3-1':'Albin','3-4':'Kazimir','3-7':'Tomaž','3-8':'Janez','3-9':'Frančiška',
    '3-12':'Gregor','3-17':'Patrik','3-19':'Jožef','3-20':'Klavdija','3-21':'Benedikt',
    '3-25':'Blagovest','3-30':'Amadej','3-31':'Benjamin',
  }
  const RS: Record<string, string> = {
    '1-1':'Нова година','1-2':'Игњатије','1-3':'Јулијана','1-6':'Богојављење',
    '1-7':'Божић','1-9':'Стефан','1-12':'Татјана','1-14':'Нова година (стара)',
    '1-17':'Антоније','1-18':'Атанасије','1-19':'Теофан','1-20':'Јован',
    '1-21':'Максим','1-22':'Тимотеј','1-25':'Григорије','1-27':'Сава',
    '1-29':'Игњатије','1-30':'Три Јерарха','1-31':'Кирил,Методије',
    '2-1':'Трифун','2-2':'Сретење','2-6':'Дорофеј','2-10':'Харалампије',
    '2-14':'Валентин','2-15':'Сретење','2-23':'Свети Харалампије',
    '3-1':'Евдокија','3-6':'Тимотеј','3-8':'Жилен дан','3-9':'Сави',
    '3-19':'Дарко','3-22':'Свети 40 мученика','3-25':'Благовести',
    '3-30':'Алексеј','3-31':'Кирил',
  }
  const BG: Record<string, string> = {
    '1-1':'Васил,Василка','1-2':'Игнат','1-6':'Йордан,Йорданка,Богдан',
    '1-7':'Иванов ден','1-17':'Антон,Антоний,Антония','1-18':'Атанас,Атанаска',
    '1-20':'Ефтимий','1-21':'Емилиян','1-25':'Григорий',
    '1-27':'Савва','1-30':'Три светители',
    '2-1':'Трифон','2-2':'Сретение','2-10':'Харалампий',
    '2-14':'Валентин,Валентина','3-1':'Баба Марта',
    '3-3':'Национален празник','3-8':'Женски ден','3-9':'Четирисет мъченици',
    '3-19':'Дарин','3-25':'Благовещение','3-27':'Матей',
    '3-30':'Алексей','3-31':'Кирил',
  }
  const result: { country: string; flag: string; names: string }[] = []
  if (CZ[key]) result.push({ country: 'Česko', flag: '🇨🇿', names: CZ[key] })
  if (PL[key]) result.push({ country: 'Poľsko', flag: '🇵🇱', names: PL[key] })
  if (HU[key]) result.push({ country: 'Maďarsko', flag: '🇭🇺', names: HU[key] })
  if (AT[key]) result.push({ country: 'Rakúsko', flag: '🇦🇹', names: AT[key] })
  if (HR[key]) result.push({ country: 'Chorvátsko', flag: '🇭🇷', names: HR[key] })
  if (SI[key]) result.push({ country: 'Slovinsko', flag: '🇸🇮', names: SI[key] })
  if (RS[key]) result.push({ country: 'Srbsko', flag: '🇷🇸', names: RS[key] })
  if (BG[key]) result.push({ country: 'Bulharsko', flag: '🇧🇬', names: BG[key] })
  return result
}

/* ── Mini expandable from main panel ── */
export function NamedayMini({ showLabel, onOpenChange }: { showLabel?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  useEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])
  const now = useMemo(() => new Date(), [])
  const { t, lang } = useLang()
  const loc = lang === 'sk' ? sk : enUS

  const today = getNameday(now)
  const tomorrow = getTomorrowNameday(now)
  const slavicNames = getSlavicNamedays(now)
  const weekday = format(now, 'EEEE', { locale: loc })

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/8 border border-yellow-500/15 hover:bg-yellow-500/15 transition-all text-[10px] shrink-0">
        {showLabel && <span className="text-slate-400">{lang === 'sk' ? 'Dnes má meniny' : 'Name day'}</span>}
        <span className="text-yellow-300 font-bold">{today}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[360px] bg-[var(--bg-card)] border border-yellow-500/20 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-yellow-300">🎂 {t('nameday.title')}</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>

            {/* SK namedays */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] text-yellow-600 uppercase tracking-wide mb-0.5">🇸🇰 {t('nameday.today')}</div>
                  <div className="text-base font-bold text-yellow-300">🎂 {today}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-yellow-700 uppercase tracking-wide mb-0.5">{t('nameday.tomorrow')}</div>
                  <div className="text-sm font-semibold text-yellow-400/70">🎂 {tomorrow}</div>
                </div>
              </div>
            </div>

            {/* Slavic countries */}
            {slavicNames.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Meniny v slovanských krajinách</div>
                {slavicNames.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-base">{s.flag}</span>
                    <div>
                      <div className="text-[9px] text-slate-500">{s.country}</div>
                      <div className="text-[11px] font-semibold text-slate-200">{s.names}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function NamedayWidget() {
  const now = useMemo(() => new Date(), [])
  const { t, lang } = useLang()
  const loc = lang === 'sk' ? sk : enUS

  const today = getNameday(now)
  const tomorrow = getTomorrowNameday(now)
  const holiday = getHoliday(now)
  const nextHoliday = getNextHoliday(now)
  const moon = calculateMoonPhase(now)
  const fullMoonDate = nextFullMoon(now)
  const dayOfYear = getDayOfYear(now)
  const isLeap = new Date(now.getFullYear(), 1, 29).getDate() === 29
  const daysInYear = isLeap ? 366 : 365
  const yearProgress = Math.round((dayOfYear / daysInYear) * 100)

  const dateLabel = format(now, 'd. MMMM yyyy', { locale: loc })
  const weekday = format(now, 'EEEE', { locale: loc })
  const weekNum = format(now, 'w', { locale: loc })
  const fullMoonLabel = format(fullMoonDate, 'd. MMMM', { locale: loc })

  return (
    <WidgetCard accent="yellow" className="h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
      <div className="relative space-y-2.5">
        <div>
          <div className="widget-title">
            <span>📅</span>
            <span>{t('nameday.title')}</span>
          </div>
          <div className="text-xl font-bold text-white capitalize">{weekday}</div>
          <div className="text-sm text-slate-400">{dateLabel}</div>
          <div className="text-xs text-slate-600 mt-0.5">{t('nameday.week')} {weekNum}</div>
        </div>

        {/* Today + Tomorrow namedays in one box */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] text-yellow-600 uppercase tracking-wide mb-0.5">{t('nameday.today')}</div>
              <div className="text-base font-bold text-yellow-300">🎂 {today}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-yellow-700 uppercase tracking-wide mb-0.5">{t('nameday.tomorrow')}</div>
              <div className="text-sm font-semibold text-yellow-400/70">🎂 {tomorrow}</div>
            </div>
          </div>
        </div>

        {holiday && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
            <div className="text-[10px] text-rose-600 uppercase tracking-wide mb-0.5">{t('holiday')}</div>
            <div className="text-sm font-semibold text-rose-300">🎉 {holiday}</div>
          </div>
        )}

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5">
          <div className="text-[10px] text-purple-500 uppercase tracking-wide mb-1">{t('nameday.moonPhase')}</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl leading-none">{moon.emoji}</div>
              <div className="text-xs font-semibold text-purple-300 mt-1">{moon.name}</div>
              <div className="text-[10px] text-slate-500">{t('nameday.illumination')}: {moon.illumination}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">{t('nameday.fullMoon')}:</div>
              <div className="text-xs font-bold text-yellow-300">{fullMoonLabel}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t('nameday.inDays')} {moon.daysToFull} {t('nameday.days')}</div>
            </div>
          </div>
          <div className="mt-2 bg-white/5 rounded-full h-1">
            <div className="bg-gradient-to-r from-purple-400 to-yellow-300 h-1 rounded-full" style={{ width: `${moon.illumination}%` }} />
          </div>
        </div>

        {!holiday && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
            <div className="text-[10px] text-emerald-600 uppercase tracking-wide mb-0.5">{t('nameday.nextHoliday')}</div>
            <div className="text-sm font-semibold text-emerald-300">🗓️ {nextHoliday.name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {t('nameday.inDays')} {nextHoliday.daysUntil} {t('nameday.days')}
              {' · '}
              {format(nextHoliday.date, 'd. MMMM', { locale: loc })}
            </div>
          </div>
        )}

        <div className="border-t border-white/5 pt-2">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>{t('nameday.year')} {now.getFullYear()}</span>
            <span>{yearProgress}% {t('nameday.done')}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full" style={{ width: `${yearProgress}%` }} />
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
