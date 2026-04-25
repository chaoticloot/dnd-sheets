import React, { useState } from 'react';
import { ParsedCharacter } from '../lib/foundryParser';
import { Shield, X, Dice5, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RollRecord {
  id: string;
  source: string;
  result: number;
  formula: string;
  timestamp: Date;
}

interface Props {
  char: ParsedCharacter;
}

const ABILITY_LABELS: Record<string, string> = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma'
};

const SKILLS_LIST = [
  { key: 'acr', label: 'Acrobatics', ability: 'dex' },
  { key: 'ani', label: 'Animal Handling', ability: 'wis' },
  { key: 'arc', label: 'Arcana', ability: 'int' },
  { key: 'ath', label: 'Athletics', ability: 'str' },
  { key: 'dec', label: 'Deception', ability: 'cha' },
  { key: 'his', label: 'History', ability: 'int' },
  { key: 'ins', label: 'Insight', ability: 'wis' },
  { key: 'itm', label: 'Intimidation', ability: 'cha' },
  { key: 'inv', label: 'Investigation', ability: 'int' },
  { key: 'med', label: 'Medicine', ability: 'wis' },
  { key: 'nat', label: 'Nature', ability: 'int' },
  { key: 'prc', label: 'Perception', ability: 'wis' },
  { key: 'prf', label: 'Performance', ability: 'cha' },
  { key: 'per', label: 'Persuasion', ability: 'cha' },
  { key: 'rel', label: 'Religion', ability: 'int' },
  { key: 'slt', label: 'Sleight of Hand', ability: 'dex' },
  { key: 'ste', label: 'Stealth', ability: 'dex' },
  { key: 'sur', label: 'Survival', ability: 'wis' },
];

function formatMod(val: number) {
  return val >= 0 ? `+${val}` : `${val}`;
}

function Section({ title, children, className = '' }: any) {
  return (
    <div className={`flex flex-col mt-2 ${className}`}>
      <div className="bg-gray-100 print:bg-[#e2e2e2] text-black uppercase text-[10px] font-bold py-1 px-2 border-b border-gray-300 print:border-dnd-border flex justify-between items-center print-break-inside-avoid shrink-0 rounded-t">
        <span>{title}</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}

export function CharacterSheet({ char }: Props) {
  const [selectedSpell, setSelectedSpell] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rollLog, setRollLog] = useState<RollRecord[]>([]);
  const [showRollLog, setShowRollLog] = useState(false);
  
  const [currentHp, setCurrentHp] = useState(char.hp.value);
  const [tempHp, setTempHp] = useState(char.hp.temp);

  // When char changes, sync HP optionally, or leave it. This simple effect syncs it on load.
  React.useEffect(() => {
    setCurrentHp(char.hp.value);
    setTempHp(char.hp.temp);
  }, [char]);

  const handleRoll = (source: string, mod: number | string, isFormula: boolean = false) => {
    // Basic roll logic
    const base = Math.floor(Math.random() * 20) + 1;
    const isNum = typeof mod === 'number' && !isFormula;
    let res = base;
    let formula = '';
    
    if (isNum) {
       res = base + Number(mod);
       formula = `1d20 ${Number(mod) >= 0 ? '+' : '-'} ${Math.abs(Number(mod))}`;
    } else {
       const formulaStr = String(mod).replace(/\s+/g, '');
       formula = formulaStr;
       res = 0;
       
       // simple regex to find all NdX or constants
       const parts = formulaStr.match(/([+-]?\d+d\d+)|([+-]?\d+)/g);
       if (parts) {
          res = parts.reduce((acc, part) => {
             if (part.includes('d')) {
                const [count, sidestr] = part.split('d');
                let numDice = parseInt(count);
                const isNegative = count.startsWith('-');
                if (isNegative) numDice = Math.abs(numDice);
                else if (count === '' || count === '+') numDice = 1;
                
                const sides = parseInt(sidestr);
                let subTotal = 0;
                for (let i = 0; i < numDice; i++) subTotal += Math.floor(Math.random() * sides) + 1;
                return acc + (isNegative ? -subTotal : subTotal);
             } else {
                return acc + parseInt(part);
             }
          }, 0);
       }
    }
    
    setRollLog(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      source,
      result: res,
      formula,
      timestamp: new Date()
    }, ...prev]);
    setShowRollLog(true);
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto bg-[#1b1c22] text-gray-300 shadow-xl print:shadow-none print:bg-white print:text-black my-8 pb-8 print:p-0 print:m-0 border-4 border-black print:border-dnd-border relative">
      
      {/* Header Section (Dark themed) */}
      <div className="bg-[#1b1c22] border-b-2 border-red-800 p-6 flex flex-col md:flex-row gap-6 items-end print:bg-white print:text-black print:border-dnd-border">
        {/* Name Area */}
        <div className="flex-1 border-b-2 border-gray-600 print:border-gray-400 pb-2 flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-wider leading-none print:text-dnd-red">
              {char.name}
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase mt-1 print:text-gray-500">
              {char.race} {char.classes}
            </p>
            <div className="flex gap-4 text-[11px] text-gray-500 mt-1 uppercase font-bold tracking-wide">
               <span>Level {char.level}</span>
               <span>{char.background}</span>
               <span>{char.alignment}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowRollLog(true)}
            className="flex items-center gap-2 bg-[#23242a] text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded border border-gray-700 text-xs font-bold uppercase transition print:hidden shadow-lg"
          >
            <History className="w-4 h-4" />
            Rolls
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Top Stats Array */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Abilities */}
          <div className="flex gap-2 bg-[#23242a] p-2 rounded-lg border border-gray-700 shadow-md print:bg-transparent print:border-0 print:p-0">
            {Object.entries(char.abilities).map(([key, ability]) => (
              <div key={key} className="relative border border-gray-600 bg-white print:border-dnd-border rounded-t rounded-b font-serif text-center w-16 h-20 flex flex-col items-center shadow-inner group transition-colors">
                <span className="uppercase text-[9px] font-bold text-gray-600 tracking-wider mt-1">
                  {ABILITY_LABELS[key].substring(0, 3)}
                </span>
                <button 
                  className="text-3xl font-bold text-black leading-none mt-1 cursor-pointer hover:text-red-700 transition"
                  onClick={() => handleRoll(`${ABILITY_LABELS[key]} Check`, ability.mod)}
                  title={`Roll ${ABILITY_LABELS[key]} Check`}
                >
                  {formatMod(ability.mod)}
                </button>
                <div className="absolute -bottom-3 inset-x-0 mx-auto w-8 h-6 bg-white text-black print:text-dnd-ink rounded-full font-bold text-xs border border-gray-500 print:border-dnd-border flex items-center justify-center pointer-events-none">
                  {ability.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="border border-red-800 bg-[#23242a] print:bg-white rounded-lg p-2 text-center w-20 flex flex-col justify-center items-center">
              <span className="uppercase text-[9px] font-bold text-gray-400 print:text-dnd-red tracking-wider">Proficiency<br/>Bonus</span>
              <div className="font-serif text-2xl font-bold text-white print:text-dnd-ink leading-none mt-1">
                {formatMod(char.proficiencyBonus)}
              </div>
            </div>
            
            <div className="border border-red-800 bg-[#23242a] print:bg-white rounded-lg p-2 text-center w-20 flex flex-col justify-center items-center">
              <span className="uppercase text-[9px] font-bold text-gray-400 print:text-dnd-red tracking-wider">Walking<br/>Speed</span>
              <div className="font-serif text-2xl font-bold text-white print:text-dnd-ink leading-none mt-1 flex items-baseline">
                {typeof char.speed === 'object' ? (char.speed as any).value || 30 : char.speed} <span className="text-xs ml-0.5">ft.</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] border border-red-800 bg-[#23242a] print:bg-white rounded-lg p-3 flex flex-col relative justify-center">
             <table className="w-full text-center mt-2 mb-1">
               <thead>
                 <tr className="text-[10px] text-gray-400 uppercase font-bold tracking-wider print:text-gray-500">
                   <th className="font-normal text-emerald-500 print:text-emerald-700">Current</th>
                   <th className="font-normal text-gray-500 w-4"></th>
                   <th className="font-normal text-gray-500">Max</th>
                   <th className="font-normal text-gray-500">Temp</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td className="align-bottom">
                     <input 
                       type="number"
                       className="w-16 bg-transparent text-4xl font-bold focus:outline-none text-center text-white p-0 m-0 print:text-black font-sans"
                       value={currentHp}
                       onChange={(e) => setCurrentHp(Number(e.target.value))}
                     />
                   </td>
                   <td className="text-2xl text-gray-500 align-bottom pb-1 px-2">/</td>
                   <td className="text-3xl font-bold text-gray-400 align-bottom pb-1">{char.hp.max}</td>
                   <td className="align-bottom pb-1">
                     <input
                       type="number"
                       className="w-12 bg-transparent text-2xl font-bold text-center text-blue-400 focus:outline-none p-0 m-0"
                       value={tempHp || ''}
                       placeholder="--"
                       onChange={(e) => setTempHp(Number(e.target.value))}
                     />
                   </td>
                 </tr>
               </tbody>
             </table>
             <div className="absolute -bottom-2 right-4 bg-[#23242a] px-2 text-[10px] text-gray-400 uppercase font-bold border border-red-800 rounded print:bg-white print:text-dnd-ink">
               Hit Points
             </div>
          </div>
        </div>

        {/* 3 Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* COLUMN 1: Saves & Details */}
          <div className="w-full lg:w-60 flex-shrink-0 flex flex-col gap-4">
            
            <Section title="Saving Throws" className="rounded-lg border-gray-700 bg-[#23242a] print:bg-white">
              <div className="flex flex-col gap-1 text-sm bg-white text-black p-2 rounded">
                <div className="flex border-b border-gray-300 pb-1 px-1 text-[9px] uppercase font-bold text-gray-500">
                  <span className="w-8 text-center">Prof</span><span className="w-8 text-center">Mod</span><span className="ml-1">Save</span>
                </div>
                {Object.entries(char.abilities).map(([key, ability]) => {
                  const saveMod = ability.mod + (ability.saveProf ? char.proficiencyBonus : 0);
                  return (
                    <div 
                      key={key} 
                      className="py-0.5 flex items-center hover:bg-gray-100 cursor-pointer rounded transition-colors group"
                      onClick={() => handleRoll(`${ABILITY_LABELS[key]} Save`, saveMod)}
                    >
                      <div className="w-8 flex justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full border border-gray-400 flex-shrink-0 ${ability.saveProf ? 'bg-black' : 'bg-transparent'}`} />
                      </div>
                      <div className={`w-8 font-bold text-center group-hover:text-red-700 ${ability.saveProf ? 'text-black' : 'text-gray-500 font-normal'}`}>{formatMod(saveMod)}</div>
                      <div className="uppercase tracking-tight text-xs font-bold ml-2">{key}</div>
                    </div>
                  );
                })}
              </div>
            </Section>
            
            <Section title="Senses" className="rounded-lg border-gray-700 bg-[#23242a] print:bg-white">
              <div className="flex flex-col gap-2 p-2 bg-white text-black rounded">
                <div className="flex items-center gap-2 border border-blue-200 rounded p-1.5 px-3">
                  <div className="font-bold text-lg">{char.passivePerception}</div>
                  <div className="uppercase text-[10px] font-bold text-gray-600">Passive Perception</div>
                </div>
                <div className="flex items-center gap-2 border border-blue-200 rounded p-1.5 px-3">
                  <div className="font-bold text-lg">{char.passiveInvestigation}</div>
                  <div className="uppercase text-[10px] font-bold text-gray-600">Passive Investigation</div>
                </div>
                {char.traits.senses && char.traits.senses.trim() && (
                   <div className="text-[10px] uppercase font-bold text-gray-500 text-center mt-1 border-t border-gray-100 pt-2">
                      {char.traits.senses}
                   </div>
                )}
              </div>
            </Section>

            <Section title="Proficiencies & Training" className="rounded-lg border-gray-700 bg-[#23242a] print:bg-white">
              <div className="bg-white text-black p-3 rounded flex flex-col gap-3 text-[11px]">
                <div>
                  <h4 className="font-bold uppercase text-[9px] text-gray-500 border-b border-gray-200 mb-1">Armor</h4>
                  <p>{char.proficiencies.armor}</p>
                </div>
                <div>
                  <h4 className="font-bold uppercase text-[9px] text-gray-500 border-b border-gray-200 mb-1">Weapons</h4>
                  <p>{char.proficiencies.weapons}</p>
                </div>
                <div>
                  <h4 className="font-bold uppercase text-[9px] text-gray-500 border-b border-gray-200 mb-1">Tools</h4>
                  <p>{char.proficiencies.tools}</p>
                </div>
                <div>
                  <h4 className="font-bold uppercase text-[9px] text-gray-500 border-b border-gray-200 mb-1">Languages</h4>
                  <p>{char.traits.languages}</p>
                </div>
              </div>
            </Section>
          </div>

          {/* COLUMN 2: Skills */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
             <Section title="Skills" className="rounded-lg border-gray-700 bg-[#23242a] print:bg-white h-full">
              <div className="flex flex-col gap-0 text-[11px] bg-white text-black p-2 rounded h-full">
                <div className="flex border-b border-gray-300 pb-1 px-1 text-[9px] uppercase font-bold text-gray-500">
                  <span className="w-8 text-center">Prof</span><span className="w-8 text-center">Attr</span><span className="flex-1 ml-2 text-left">Skill</span><span className="w-8 text-center">Bonus</span>
                </div>
                {SKILLS_LIST.map((skill) => {
                  const sk = char.skills[skill.key];
                  if (!sk) return null;
                  const isProf = sk.prof > 0;
                  const isExp = sk.prof > 1;
                  return (
                    <div 
                      key={skill.key} 
                      className="border-b border-gray-100 py-1.5 flex items-center last:border-0 hover:bg-gray-100 cursor-pointer transition-colors group"
                      onClick={() => handleRoll(`${skill.label} Check`, sk.mod)}
                    >
                      <div className="w-8 flex justify-center">
                        <div className={`w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center flex-shrink-0 ${isProf ? 'bg-black' : 'bg-transparent'}`}>
                           {isExp && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                        </div>
                      </div>
                      <span className="uppercase text-[9px] w-8 text-center text-gray-500 font-bold">{skill.ability.substring(0,3)}</span>
                      <span className={`font-medium flex-1 ml-2 truncate ${isProf ? 'text-black' : 'text-gray-700'}`}>{skill.label}</span>
                      <div className={`w-8 font-bold text-center border-l border-gray-200 group-hover:text-red-700 ${isProf ? 'text-black' : 'text-gray-500 font-normal'}`}>{formatMod(sk.mod)}</div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* COLUMN 3: Actions & Details */}
          <div className="flex-1 flex flex-col gap-4">
             <div className="flex gap-4">
                <div className="border border-red-800 bg-[#23242a] print:bg-white rounded p-2 text-center w-24 flex flex-col items-center">
                  <span className="uppercase text-[9px] font-bold text-gray-400 print:text-dnd-red tracking-wider mb-1">Initiative</span>
                  <button 
                    className="font-serif text-3xl font-bold text-white print:text-dnd-ink leading-none bg-white/10 w-full py-2 rounded border border-white/20 print:border-dnd-border hover:bg-white/20 transition-colors cursor-pointer"
                    onClick={() => handleRoll('Initiative', char.initiative)}
                    title="Roll Initiative"
                  >
                    {formatMod(char.initiative)}
                  </button>
                </div>
                <div className="border border-red-800 bg-[#23242a] print:bg-white rounded p-2 text-center w-24 flex flex-col items-center relative">
                  <Shield className="absolute inset-0 m-auto w-16 h-16 text-gray-700 print:text-gray-200 opacity-30" />
                  <span className="uppercase text-[9px] font-bold text-gray-400 print:text-dnd-red tracking-wider mb-1 relative">Armor<br/>Class</span>
                  <div className="font-serif text-3xl font-bold text-white print:text-dnd-ink leading-none mt-1 relative">
                    {char.ac}
                  </div>
                </div>
                
                <div className="flex-1 border border-gray-700 bg-[#23242a] print:bg-white rounded p-3">
                   <div className="flex justify-between items-center border-b border-gray-600 print:border-gray-300 pb-1 mb-2">
                       <span className="uppercase text-[10px] font-bold text-gray-400 print:text-gray-600">Defenses & Conditions</span>
                   </div>
                   <div className="text-[11px] space-y-1">
                      {char.traits.immunities && char.traits.immunities !== 'None' && (
                         <div className="flex gap-2"><span className="text-gray-500 font-bold w-16 text-right">Immune</span> <span className="text-gray-200 print:text-black">{char.traits.immunities}</span></div>
                      )}
                      {char.traits.resistances && char.traits.resistances !== 'None' && (
                         <div className="flex gap-2"><span className="text-gray-500 font-bold w-16 text-right">Resist</span> <span className="text-gray-200 print:text-black">{char.traits.resistances}</span></div>
                      )}
                      <div className="flex gap-2"><span className="text-gray-500 font-bold w-16 text-right">Hit Dice</span> <span className="text-gray-200 print:text-black">{char.hitDice}</span></div>
                   </div>
                </div>
             </div>

             <Section title="Actions & Attacks" className="rounded border-gray-700 bg-white text-black min-h-[200px]">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-800 font-bold uppercase text-[9px] text-gray-500">
                      <th className="p-2 w-1/3">Attack</th>
                      <th className="p-2 w-24 text-center">Hit/DC</th>
                      <th className="p-2 w-32 text-center">Damage</th>
                      <th className="p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {char.weapons.map((w, idx) => {
                      const damageParts = w.damage.split(' (Versatile: ');
                      const baseDmg = damageParts[0];
                      const verDmg = damageParts.length > 1 ? damageParts[1].replace(')', '') : null;
                      
                      return (
                      <tr key={idx} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="p-2">
                           <div className="font-bold text-black">{w.name}</div>
                           <div className="text-[9px] text-gray-500 uppercase">{w.type}</div>
                        </td>
                        <td 
                          className="p-2 text-center cursor-pointer group"
                          onClick={() => handleRoll(`${w.name} Attack`, Number(w.attackBonus))}
                        >
                           <span className="border border-gray-300 rounded px-2 py-1 font-bold bg-white shadow-sm inline-block min-w-[32px] group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                             {w.attackBonus ? formatMod(Number(w.attackBonus)) : '-'}
                           </span>
                        </td>
                        <td className="p-2 text-center flex flex-col items-center gap-1">
                           <span 
                             className="border border-gray-300 rounded px-2 py-1 font-bold bg-white shadow-sm inline-block cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors text-xs"
                             onClick={() => handleRoll(`${w.name} Damage`, baseDmg, true)}
                           >
                              {baseDmg || '-'}
                           </span>
                           {verDmg && (
                             <span 
                               className="border border-gray-200 rounded px-2 py-0.5 font-bold bg-gray-50 text-[10px] text-gray-500 shadow-sm inline-block cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
                               onClick={() => handleRoll(`${w.name} Versatile`, verDmg, true)}
                             >
                                Versatile: {verDmg}
                             </span>
                           )}
                        </td>
                        <td className="p-2 text-gray-500 italic text-[10px]"></td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                {char.weapons.length === 0 && <div className="p-4 text-center text-gray-500 italic text-sm">No actions configured.</div>}
             </Section>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section title="Inventory" className="rounded border-gray-700 bg-white text-black h-[400px]">
                   {char.currency && (
                     <div className="flex justify-between items-center bg-gray-100 p-2 border-b border-gray-200 shrink-0">
                       <div className="flex gap-2 text-xs font-bold font-fantasy tabular-nums tracking-tighter">
                         <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded" title="Platinum">PP {char.currency.pp}</span>
                         <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded" title="Gold">GP {char.currency.gp}</span>
                         <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded" title="Electrum">EP {char.currency.ep}</span>
                         <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded" title="Silver">SP {char.currency.sp}</span>
                         <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded" title="Copper">CP {char.currency.cp}</span>
                       </div>
                     </div>
                   )}
                   <div className="p-2 flex flex-col gap-1 text-[11px] overflow-y-auto flex-1 min-h-0">
                     {char.inventory.length > 0 ? char.inventory.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0 hover:bg-gray-100 cursor-pointer transition-colors px-2 rounded group"
                          onClick={() => setSelectedItem(item)}
                        >
                           <div className="flex items-center gap-2">
                              {item.equipped && <Shield className="w-3 h-3 text-emerald-600" title="Equipped" />}
                              {!item.equipped && <div className="w-3 h-3" />}
                              <span className="font-bold font-serif group-hover:text-red-700 transition-colors">{item.name}</span>
                              {item.quantity > 1 && <span className="text-[9px] text-gray-500 font-bold uppercase py-0.5 px-1 bg-gray-200 rounded">x{item.quantity}</span>}
                           </div>
                           <span className="text-gray-400 font-mono text-[10px]">{item.weight > 0 ? item.weight + ' lb' : ''}</span>
                        </div>
                     )) : (
                        <div className="text-center text-gray-500 italic py-4">Inventory empty</div>
                     )}
                   </div>
                </Section>
                <Section title="Spells" className="rounded border-gray-700 bg-white text-black h-[400px]">
                   {char.spellcasting && (
                     <div className="flex justify-between items-center bg-gray-100 p-2 border-b border-gray-200 shrink-0 text-xs font-bold font-fantasy tabular-nums tracking-tighter">
                       <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Spell DC: {char.spellcasting.dc}</span>
                       <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Spell Attack: {formatMod(char.spellcasting.attackBonus)}</span>
                     </div>
                   )}
                   <div className="p-2 flex flex-col gap-1 text-[11px] overflow-y-auto flex-1 min-h-0">
                      {char.spells.length > 0 ? [...char.spells].sort((a, b) => {
                         const aPrep = a.prepared || a.level === 0;
                         const bPrep = b.prepared || b.level === 0;
                         if (aPrep && !bPrep) return -1;
                         if (!aPrep && bPrep) return 1;
                         if (a.level !== b.level) return a.level - b.level;
                         return a.name.localeCompare(b.name);
                      }).map((s, idx) => {
                         const isPrepared = s.prepared || s.level === 0; // cantrips act as prepared
                         return (
                         <div key={idx} 
                              className={`flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0 hover:bg-gray-100 cursor-pointer transition-colors px-2 rounded group ${!isPrepared ? 'opacity-60 grayscale' : ''}`}
                              onClick={() => setSelectedSpell(s)}>
                           <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isPrepared ? 'bg-emerald-500' : 'bg-gray-300'}`} title={isPrepared ? 'Prepared' : 'Unprepared'} />
                             <span className="font-bold font-serif text-dnd-red group-hover:text-red-700 transition-colors">{s.name}</span>
                           </div>
                           <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{s.level === 0 ? 'Cantrip' : `Level ${s.level}`} • {s.school}</span>
                        </div>
                       );
                      }) : (
                         <div className="text-center text-gray-500 italic py-4">No spells</div>
                      )}
                   </div>
                </Section>
             </div>

             <Section title="Features & Traits" className="rounded border-gray-700 bg-white text-black min-h-[200px]">
                <div className="p-3 columns-1 xl:columns-2 gap-4 space-y-4 text-[11px]">
                   {char.features.map((feat, idx) => (
                      <div key={idx} className="break-inside-avoid">
                         <div className="font-bold text-black border-b border-gray-200 mb-1">{feat.name}</div>
                         <div className="text-gray-700 feature-desc" dangerouslySetInnerHTML={{ __html: feat.description }} onClick={(e) => {
                            const target = e.target as HTMLElement;
                            const rollFormula = target.getAttribute('data-roll') || target.closest('[data-roll]')?.getAttribute('data-roll');
                            if (rollFormula) handleRoll(`${feat.name} Roll`, rollFormula, true);
                         }} />
                      </div>
                   ))}
                </div>
             </Section>
          </div>
          
        </div>
      </div>
      
      <div className="absolute bottom-1 right-2 opacity-30 text-[10px] font-bold uppercase print:text-black">
         Foundry VTT Exporter v1.1
      </div>

      <AnimatePresence>
        {selectedSpell && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 print:hidden backdrop-blur-sm"
            onClick={() => setSelectedSpell(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white text-black w-full max-w-2xl max-h-[85vh] rounded shadow-2xl flex flex-col border border-gray-400 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#1b1c22] border-b-2 border-red-800 p-4 flex justify-between items-start text-white">
                <div>
                  <h2 className="text-2xl font-serif font-bold tracking-wide">{selectedSpell.name}</h2>
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">
                     {selectedSpell.level === 0 ? 'Cantrip' : `Level ${selectedSpell.level}`} • {selectedSpell.school}
                     {selectedSpell.prepared && <span className="ml-2 text-emerald-400">• Prepared</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 mt-2 bg-black/30 p-2 rounded tracking-wide leading-none">
                     {selectedSpell.action ? <div className="flex items-center gap-1"><span className="text-gray-500">CAST:</span> {selectedSpell.action}</div> : null}
                     {selectedSpell.range ? <div className="flex items-center gap-1"><span className="text-gray-500">RNG:</span> {selectedSpell.range}</div> : null}
                     {selectedSpell.targets ? <div className="flex items-center gap-1"><span className="text-gray-500">TGT:</span> {selectedSpell.targets}</div> : null}
                     {selectedSpell.duration ? <div className="flex items-center gap-1"><span className="text-gray-500">DUR:</span> {selectedSpell.duration} {selectedSpell.concentration && <span className="text-yellow-500 ml-1 font-bold">(C)</span>}</div> : null}
                  </div>
                  {selectedSpell.materials && (
                    <div className="text-[10px] font-bold text-gray-400 mt-2 bg-black/30 p-2 rounded tracking-wide">
                      <span className="text-gray-500 pr-1">MAT:</span> {selectedSpell.materials}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedSpell(null)} className="text-gray-400 hover:text-white transition-colors bg-black/20 p-2 rounded-full hover:bg-black/50 ml-4">
                   <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-800 leading-relaxed font-serif feature-desc">
                 <div dangerouslySetInnerHTML={{ __html: selectedSpell.description || 'No description provided.' }} onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const rollFormula = target.getAttribute('data-roll') || target.closest('[data-roll]')?.getAttribute('data-roll');
                    if (rollFormula) handleRoll(`${selectedSpell.name} Roll`, rollFormula, true);
                 }} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 print:hidden backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white text-black w-full max-w-md max-h-[85vh] rounded shadow-2xl flex flex-col border border-gray-400 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#23242a] border-b-2 border-gray-600 p-4 flex justify-between items-center text-white">
                <div>
                  <h2 className="text-xl font-serif font-bold tracking-wide flex items-center gap-2">
                     {selectedItem.name}
                     {selectedItem.equipped && <Shield className="w-4 h-4 text-emerald-500" />}
                  </h2>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1 space-x-2">
                     <span>Weight: {selectedItem.weight} lb</span>
                     <span>Quantity: {selectedItem.quantity}</span>
                     {selectedItem.price ? <span>Price: {selectedItem.price.value} {selectedItem.price.denomination}</span> : null}
                  </div>
                  {(selectedItem.armorValue !== undefined && selectedItem.armorValue > 0) && (
                    <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider mt-2 bg-black/30 p-2 rounded w-fit text-gray-300">
                      <span>AC: {selectedItem.armorValue}</span>
                      {(!selectedItem.isShield && selectedItem.armorDexCap !== undefined) && (
                        <span>• Max Dex: {selectedItem.armorDexCap === null ? 'None' : selectedItem.armorDexCap}</span>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white transition-colors bg-black/20 p-2 rounded-full hover:bg-black/50">
                   <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-800 leading-relaxed font-serif feature-desc">
                 <div dangerouslySetInnerHTML={{ __html: selectedItem.description || 'No description provided.' }} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {showRollLog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/40 print:hidden backdrop-blur-sm"
            onClick={() => setShowRollLog(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm h-full bg-[#1b1c22] border-l-2 border-red-800 shadow-2xl flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#23242a]">
                 <div className="flex items-center gap-2 text-white font-bold tracking-widest uppercase">
                    <Dice5 className="text-red-500" />
                    Roll Log
                 </div>
                 <button onClick={() => setShowRollLog(false)} className="text-gray-400 hover:text-white transition">
                    <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                 {rollLog.length === 0 ? (
                    <div className="text-center text-gray-600 text-sm mt-10 uppercase tracking-widest font-bold">
                       No rolls yet
                    </div>
                 ) : rollLog.map(roll => (
                    <div key={roll.id} className="bg-[#23242a] border border-gray-700 rounded p-3 text-white shadow-xl flex flex-col">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs uppercase font-bold text-gray-400">{roll.source}</span>
                          <span className="text-[9px] text-gray-600">{roll.timestamp.toLocaleTimeString()}</span>
                       </div>
                       <div className="flex items-end gap-3 border-t border-gray-700 pt-2">
                          <div className="text-4xl font-serif font-bold text-red-500 leading-none">{roll.result}</div>
                          <div className="text-xs text-gray-500 font-mono mb-1">{roll.formula}</div>
                       </div>
                    </div>
                 ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
