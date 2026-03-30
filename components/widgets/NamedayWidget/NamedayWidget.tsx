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
