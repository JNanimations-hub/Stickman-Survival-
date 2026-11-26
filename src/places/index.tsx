import React from "react";
import { INK, LOOKS, mix } from "../kit/light";
import { rnd } from "../kit/helpers";
import {
  PlaceProps, O, thin, Sky, Mountain, Ground, Tree, Fence, House, Room, InWindow, Lamp, DoorIn, Shelf, Table,
} from "./kit";

// PLACES LIBRARY — one component per location in the story bible's PLACES LIST.
// Each entry says where the floor is and where the character and dog stand by default.

export interface PlaceDef {
  C: React.FC<PlaceProps>;
  floorY: number;     // y of the ground line where feet go
  charX: number;      // default character x
  dogX: number;       // default dog x
  scale: number;      // character scale in this place (wide shot)
  outdoor: boolean;
  label: string;      // human name (matches the bible)
}

const lamp = (p: PlaceProps) => (p.lampsOff ? 0 : LOOKS[p.tod].lampOn);

// 1. Ember Valley from above, Mount Grael behind
const Valley: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="valley" />
    <Mountain x={1250} base={720} w={1300} h={560} f={p.f} eruption={p.eruption} ash={p.ash} tod={p.tod} />
    <path d="M -200 700 Q 400 620 900 690 T 2200 660 L 2200 1300 L -200 1300 Z" fill={mix("#7fae63", "#8b8781", p.ash * 0.85)} {...O} />
    <path d="M -200 860 Q 300 800 700 850 T 1500 830 T 2200 860" stroke={mix("#5aa4d8", "#7d7a76", p.ash)} strokeWidth={34} fill="none" strokeLinecap="round" />
    {[[260, 760], [420, 790], [600, 770], [1500, 790], [1660, 770], [980, 800]].map(([x, y], i) => (
      <House key={i} x={x} y={y} w={90} h={70} wall={["#f2e3c6", "#e6c7a8", "#d9e2ea"][i % 3]} roof={["#b4513f", "#5f6f8f", "#8a5a46"][i % 3]} ash={p.ash} lit={lamp(p)} s={1} />
    ))}
    {[150, 760, 1180, 1820].map((x, i) => <Tree key={i} x={x} y={900 + (i % 2) * 30} s={0.6} ash={p.ash} f={p.f} />)}
    <Ground y={960} color="#6f9e55" ash={p.ash} id="valley-g" />
  </g>
);

// 2. Nico's farmhouse, outside (also used for the road in front of it)
const Farmhouse: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="farm" />
    <Mountain x={1550} base={640} w={900} h={380} f={p.f} eruption={p.eruption} ash={p.ash} tod={p.tod} />
    <path d="M -200 640 Q 500 590 1000 630 T 2200 620 L 2200 1300 L -200 1300 Z" fill={mix("#8fbf6f", "#8e8a84", p.ash * 0.85)} {...O} />
    <Tree x={160} y={860} s={1.1} ash={p.ash} f={p.f} />
    <House x={560} y={860} w={560} h={360} wall="#f2e3c6" roof="#b4513f" ash={p.ash} lit={lamp(p)} porch />
    <Fence x0={900} x1={1900} y={880} ash={p.ash} />
    <Ground y={870} color="#7aa95c" ash={p.ash} id="farm-g" />
    {/* the road */}
    <path d="M -200 960 L 2200 960 L 2200 1080 L -200 1080 Z" fill={mix("#5b5d63", "#8d8984", p.ash * 0.8)} {...O} />
    {[...Array(9)].map((_, i) => <rect key={i} x={-100 + i * 260} y={1012} width={130} height={10} fill="#f0e6c8" opacity={1 - p.ash} />)}
  </g>
);

// 3. Living room (window shows ash falling outside)
const LivingRoom: React.FC<PlaceProps> = (p) => (
  <g>
    <Room wall="#e9d8bd" floor="#b07d52" floorY={880} ash={p.ash * 0.3} id="living">
      <InWindow x={720} y={230} w={420} h={330} tod={p.tod} ash={p.ash} f={p.f} falling={p.ash > 0 ? 1 : 0} id="living" />
      <rect x={160} y={260} width={170} height={130} fill="#f7f3ea" {...O} />
      <path d="M 180 370 L 230 300 L 260 340 L 290 310 L 316 370 Z" fill="#7aa95c" {...thin} />
      <Lamp x={1500} y={880} on={lamp(p)} f={p.f} />
    </Room>
    {/* couch */}
    <rect x={1260} y={700} width={420} height={120} rx={30} fill="#5d7fa8" {...O} />
    <rect x={1240} y={760} width={460} height={110} rx={24} fill="#4e6f97" {...O} />
    <rect x={1250} y={860} width={20} height={20} fill={INK} /><rect x={1670} y={860} width={20} height={20} fill={INK} />
    {/* rug */}
    <ellipse cx={800} cy={950} rx={420} ry={50} fill="#b9553f" {...thin} />
  </g>
);

// 4. Kitchen
const Kitchen: React.FC<PlaceProps> = (p) => (
  <g>
    <Room wall="#dfe9d9" floor="#c7b08a" floorY={880} ash={p.ash * 0.3} id="kitchen">
      <InWindow x={1180} y={210} w={360} h={280} tod={p.tod} ash={p.ash} f={p.f} falling={p.ash > 0 ? 1 : 0} id="kitchen" curtains={false} />
      <Shelf x={180} y={330} w={460} items={["plate", "plate", "cup", "jar", "plate"]} f={p.f} rattle={p.eruption ? 1 : 0} />
      <Shelf x={180} y={480} w={460} items={["can", "can", "jar", "can"]} f={p.f} rattle={p.eruption ? 1 : 0} />
    </Room>
    {/* counter + sink */}
    <rect x={1040} y={640} width={700} height={240} fill="#7d8f9e" {...O} />
    <rect x={1020} y={610} width={740} height={34} fill="#e9e5dc" {...O} />
    <rect x={1260} y={614} width={180} height={20} fill="#9fb3c1" {...thin} />
    <path d="M 1350 612 L 1350 560 Q 1350 540 1376 540 L 1400 540" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    {[1080, 1300, 1520].map((x) => <rect key={x} x={x} y={670} width={190} height={180} rx={6} fill="#8ea0ae" {...thin} />)}
    {/* fridge */}
    <rect x={1790} y={360} width={230} height={520} rx={16} fill="#eef1f2" {...O} />
    <line x1={1790} y1={540} x2={2020} y2={540} {...thin} />
    <rect x={1810} y={440} width={12} height={70} rx={6} fill="#aab" {...thin} />
    <Table x={560} y={880} w={320} />
  </g>
);

// 5. Back yard: back door, covered rain barrel, garden, workshop shed
const BackYard: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="yard" />
    <Mountain x={1500} base={560} w={700} h={300} f={p.f} eruption={p.eruption} ash={p.ash} tod={p.tod} />
    <path d="M -200 560 Q 600 520 1200 560 T 2200 540 L 2200 1300 L -200 1300 Z" fill={mix("#8fbf6f", "#8e8a84", p.ash * 0.85)} {...O} />
    {/* back wall of the house on the left with the back door */}
    <rect x={-200} y={240} width={600} height={640} fill={mix("#f2e3c6", "#9b958d", p.ash * 0.6)} {...O} />
    <rect x={150} y={540} width={170} height={340} fill="#7b4a33" {...O} />
    <circle cx={290} cy={720} r={8} fill="#e8c35a" />
    {/* workshop shed */}
    <rect x={1500} y={560} width={340} height={300} fill={mix("#a8774d", "#8f8a83", p.ash * 0.6)} {...O} />
    <path d="M 1470 560 L 1670 450 L 1870 560 Z" fill={mix("#6b4a33", "#77726c", p.ash * 0.6)} {...O} />
    <rect x={1620} y={680} width={100} height={180} fill="#5b3a26" {...thin} />
    <Fence x0={420} x1={1460} y={860} ash={p.ash} />
    <Ground y={870} color="#7aa95c" ash={p.ash} id="yard-g" />
    {/* rain barrel with lid + stone */}
    <g transform="translate(560 880)">
      <rect x={-70} y={-170} width={140} height={170} rx={18} fill="#3f7cbf" {...O} />
      <line x1={-70} y1={-110} x2={70} y2={-110} {...thin} /><line x1={-70} y1={-50} x2={70} y2={-50} {...thin} />
      <ellipse cx={0} cy={-172} rx={80} ry={18} fill="#2c5d93" {...O} />
      <ellipse cx={10} cy={-196} rx={34} ry={22} fill="#8a8580" {...O} />
    </g>
  </g>
);

// 6. Hallway with the front door (towel along the bottom)
const Hallway: React.FC<PlaceProps> = (p) => (
  <g>
    <Room wall="#d9cdb8" floor="#9c6e48" floorY={880} ash={p.ash * 0.4} id="hall">
      <DoorIn x={1300} y={880} towel />
      <DoorIn x={420} y={880} color="#a0785a" />
      {/* coat hooks + mirror */}
      <rect x={760} y={330} width={260} height={18} fill="#7b4a33" {...thin} />
      {[800, 880, 960].map((x) => <circle key={x} cx={x} cy={360} r={8} fill={INK} />)}
      <rect x={1580} y={300} width={160} height={220} rx={80} fill="#c6dbe6" {...O} />
    </Room>
    {p.lampsOff && <rect x={-200} y={-200} width={2400} height={1500} fill="#000" opacity={0.25} />}
  </g>
);

// 7. Workshop / shed inside
const Workshop: React.FC<PlaceProps> = (p) => (
  <g>
    <Room wall="#b79a78" floor="#7d6a58" floorY={880} ash={p.ash * 0.4} id="work">
      {/* pegboard + tools */}
      <rect x={240} y={220} width={760} height={360} fill="#d7b98f" {...O} />
      {[...Array(60)].map((_, i) => <circle key={i} cx={270 + (i % 15) * 48} cy={250 + Math.floor(i / 15) * 80} r={4} fill="#8a6a48" />)}
      <path d="M 330 280 l 0 150 M 300 280 l 60 0" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <path d="M 470 290 l 0 140 M 445 430 l 50 0" stroke="#666" strokeWidth={14} strokeLinecap="round" />
      <circle cx={640} cy={350} r={60} fill="none" stroke={INK} strokeWidth={10} />
      <rect x={780} y={300} width={140} height={30} fill="#c94f3a" {...thin} />
      <InWindow x={1300} y={240} w={300} h={240} tod={p.tod} ash={p.ash} f={p.f} falling={p.ash > 0 ? 0.8 : 0} id="work" curtains={false} />
    </Room>
    <rect x={180} y={620} width={900} height={30} fill="#9b6a43" {...O} />
    <rect x={210} y={650} width={24} height={230} fill="#7d5434" {...thin} /><rect x={1030} y={650} width={24} height={230} fill="#7d5434" {...thin} />
    {/* old toolbox and the box of masks */}
    <rect x={300} y={560} width={200} height={60} rx={8} fill="#b8352b" {...O} />
    <rect x={620} y={570} width={150} height={50} fill="#f3f1ea" {...O} />
    <text x={695} y={603} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK} fontFamily="sans-serif">MASKS</text>
  </g>
);

// 8. Bedroom (ruler on the windowsill, ceiling beam visible)
const Bedroom: React.FC<PlaceProps & { broken?: boolean }> = (p) => (
  <g>
    <Room wall="#cfd8e6" floor="#a8835c" floorY={880} ash={p.ash * 0.3} id="bed">
      <rect x={-200} y={-200} width={2400} height={300} fill="#bcc6d6" />
      <rect x={-200} y={96} width={2400} height={30} fill="#8a6a48" {...thin} />
      <InWindow x={1240} y={250} w={340} h={300} tod={p.tod} ash={p.ash} f={p.f} falling={p.ash > 0 ? 1 : 0} id="bed" ruler={Math.round(p.ash * 12)} />
      <Lamp x={520} y={660} on={lamp(p)} f={p.f} />
    </Room>
    {/* bed */}
    <rect x={560} y={700} width={620} height={110} rx={14} fill="#f1efe8" {...O} />
    <rect x={560} y={740} width={620} height={90} rx={12} fill="#5f8fc7" {...O} />
    <rect x={530} y={560} width={40} height={320} rx={8} fill="#8a5d39" {...O} />
    <rect x={1170} y={680} width={36} height={200} rx={8} fill="#8a5d39" {...O} />
    <rect x={600} y={680} width={160} height={60} rx={24} fill="#fff" {...thin} />
    <rect x={380} y={660} width={160} height={220} fill="#9b6a43" {...O} />
    {p.broken && (
      <g>
        <path d="M 520 -200 L 1280 -200 L 1220 130 L 1000 70 L 860 160 L 640 90 Z" fill={mix("#6e6c6a", "#3a3a40", p.tod === "night" ? 0.6 : 0)} {...O} />
        <path d="M 560 880 Q 700 640 860 700 Q 1000 600 1180 720 Q 1260 800 1300 880 Z" fill="#9c978f" {...O} />
        {[...Array(10)].map((_, i) => <rect key={i} x={600 + rnd(`dbx${i}`) * 600} y={700 + rnd(`dby${i}`) * 140} width={90} height={18} fill="#8a6a48" transform={`rotate(${-40 + rnd(`dbr${i}`) * 80} ${640 + i * 50} 780)`} {...thin} />)}
      </g>
    )}
  </g>
);
const BedroomBroken: React.FC<PlaceProps> = (p) => <Bedroom {...p} broken />;

// 9. Porch at night with the porch light
const Porch: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="porch" />
    <Ground y={780} color="#7aa95c" ash={p.ash} id="porch-g" />
    <rect x={-200} y={-200} width={900} height={1080} fill={mix("#f2e3c6", "#9b958d", p.ash * 0.6)} {...O} />
    <rect x={260} y={520} width={190} height={360} fill="#7b4a33" {...O} />
    <circle cx={560} cy={480} r={18} fill={lamp(p) > 0 || p.tod === "night" ? "#fff0b8" : "#ddd"} {...thin} />
    {(p.tod === "night" || p.tod === "dusk") && <circle cx={560} cy={480} r={320} fill="#ffd77a" opacity={0.22} style={{ mixBlendMode: "screen" }} />}
    <rect x={-200} y={870} width={2400} height={40} fill="#a87a50" {...O} />
    {[...Array(12)].map((_, i) => <rect key={i} x={760 + i * 100} y={680} width={20} height={190} fill="#e8dcc6" {...thin} />)}
    <rect x={720} y={660} width={1300} height={24} fill="#e8dcc6" {...thin} />
    <rect x={700} y={300} width={30} height={580} fill="#e8dcc6" {...thin} />
    {p.ash > 0.05 && <rect x={700} y={652} width={1320} height={6 + p.ash * 18} fill="#bdb8b0" />}
  </g>
);

// 10. Vegetable garden / pantry shelves
const Garden: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="garden" />
    <path d="M -200 560 Q 600 520 1200 560 T 2200 540 L 2200 1300 L -200 1300 Z" fill={mix("#8fbf6f", "#8e8a84", p.ash * 0.85)} {...O} />
    <Fence x0={-100} x1={2000} y={700} ash={p.ash} />
    <Ground y={760} color="#7a5a3c" ash={p.ash} id="garden-g" />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={200 + r * 560} y={800} width={440} height={80} rx={10} fill={mix("#6b4a33", "#8d8984", p.ash * 0.7)} {...O} />
        {[0, 1, 2, 3].map((k) => (
          <g key={k} transform={`translate(${250 + r * 560 + k * 110} 800)`}>
            <path d="M 0 0 L 0 -90 M 0 -40 l -26 -20 M 0 -60 l 24 -20" stroke={mix("#3f7a3a", "#77726c", p.ash)} strokeWidth={8} strokeLinecap="round" />
            <circle cx={12} cy={-34} r={16} fill={mix("#e0483a", "#9a7a72", p.ash * 0.8)} {...thin} />
          </g>
        ))}
      </g>
    ))}
  </g>
);
const Pantry: React.FC<PlaceProps> = (p) => (
  <g>
    <Room wall="#e3d3b2" floor="#a8835c" floorY={880} ash={p.ash * 0.3} id="pantry">
      {[180, 360, 540].map((y, i) => <Shelf key={y} x={300} y={y} w={1300} items={i === 2 ? ["box", "jar", "box", "jar"] : ["can", "can", "jar", "can", "can", "jar", "can"]} f={p.f} />)}
    </Room>
  </g>
);

// 11. Front door outside, with the taped note
const FrontDoor: React.FC<PlaceProps> = (p) => (
  <g>
    <Porch {...p} />
    <g transform="translate(330 640) rotate(-4)">
      <rect x={-34} y={-24} width={68} height={50} fill="#fffbe8" {...thin} />
      {[0, 1, 2].map((i) => <line key={i} x1={-24} y1={-10 + i * 12} x2={22 - i * 8} y2={-10 + i * 12} stroke="#555" strokeWidth={3} />)}
      <rect x={-14} y={-30} width={28} height={10} fill="#e9e3b0" opacity={0.9} />
    </g>
  </g>
);

// 12. Grey town street, empty
const TownStreet: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="town" />
    <Mountain x={1700} base={560} w={700} h={330} f={p.f} eruption={p.eruption} ash={p.ash} tod={p.tod} />
    {[[200, "#e9d8bd", "#8a5a46"], [620, "#cfd8e6", "#5f6f8f"], [1040, "#f2e3c6", "#b4513f"], [1460, "#d9c9a8", "#6b4a33"]].map(([x, w, r], i) => (
      <House key={i} x={x as number} y={800} w={330} h={300} wall={w as string} roof={r as string} ash={p.ash} lit={lamp(p) * 0.6} />
    ))}
    {[400, 1250, 1840].map((x) => (
      <g key={x}>
        <rect x={x - 6} y={520} width={12} height={300} fill="#4a4f5c" {...thin} />
        <rect x={x - 30} y={506} width={60} height={20} rx={8} fill="#4a4f5c" {...thin} />
      </g>
    ))}
    <Ground y={810} color="#7a8a6a" ash={p.ash} id="town-g" />
    <path d="M -200 880 L 2200 880 L 2200 1300 L -200 1300 Z" fill={mix("#5b5d63", "#97928b", p.ash * 0.9)} {...O} />
    {/* abandoned car */}
    <g transform="translate(1500 960)">
      <rect x={-160} y={-80} width={320} height={70} rx={20} fill={mix("#3b6fb6", "#8d8984", p.ash * 0.7)} {...O} />
      <path d="M -100 -80 L -60 -130 L 70 -130 L 110 -80 Z" fill={mix("#3b6fb6", "#8d8984", p.ash * 0.7)} {...O} />
      <circle cx={-90} cy={-10} r={30} fill="#222" {...thin} /><circle cx={90} cy={-10} r={30} fill="#222" {...thin} />
      {p.ash > 0.1 && <path d="M -150 -84 Q 0 -150 150 -84" stroke="#c6c2bb" strokeWidth={10 + p.ash * 20} fill="none" />}
    </g>
  </g>
);

// 13. Dry riverbed in the valley (where the lahar comes)
const Riverbed: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="river" />
    <Mountain x={300} base={600} w={900} h={420} f={p.f} eruption={p.eruption} ash={p.ash} tod={p.tod} />
    <path d="M -200 560 L 500 640 Q 900 700 1300 620 L 2200 520 L 2200 1300 L -200 1300 Z" fill={mix("#7a8a6a", "#8d8984", p.ash * 0.85)} {...O} />
    {/* the steep bank you climb (right side) */}
    <path d="M 1300 1300 L 1380 760 Q 1500 560 1700 480 L 2200 420 L 2200 1300 Z" fill={mix("#8c7a5e", "#8b867f", p.ash * 0.7)} {...O} />
    {[1560, 1760, 1960].map((x, i) => <Tree key={x} x={x} y={520 - i * 20} s={0.7} ash={p.ash} dead={i === 1} f={p.f} />)}
    <path d="M -200 900 Q 400 820 900 880 T 1400 880 L 1400 1300 L -200 1300 Z" fill={mix("#bdb3a0", "#a39e96", p.ash * 0.8)} {...O} />
    {[...Array(18)].map((_, i) => <ellipse key={i} cx={-100 + rnd(`rb${i}`) * 1450} cy={930 + rnd(`rby${i}`) * 130} rx={18 + rnd(`rbr${i}`) * 26} ry={10 + rnd(`rbs${i}`) * 10} fill="#8f8a82" {...thin} />)}
    {[120, 700].map((x) => <Tree key={x} x={x} y={860} s={0.8} ash={p.ash} dead f={p.f} />)}
  </g>
);

// 14. Hillside above the valley (watching the lahar pass below)
const Hillside: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="hill" />
    <Mountain x={420} base={520} w={800} h={360} f={p.f} eruption={p.eruption} ash={p.ash} tod={p.tod} />
    <path d="M -200 980 Q 600 960 1000 1000 T 2200 980 L 2200 1300 L -200 1300 Z" fill={mix("#bdb3a0", "#a39e96", p.ash * 0.8)} {...O} />
    <path d="M -200 1300 L -200 760 Q 400 640 900 760 Q 1300 860 1500 880 L 2200 900 L 2200 1300 Z" fill="none" />
    <path d="M 700 1300 Q 900 900 1300 780 Q 1700 680 2200 640 L 2200 1300 Z" fill={mix("#7e8f62", "#8d8984", p.ash * 0.85)} {...O} />
    {[1500, 1900].map((x) => <Tree key={x} x={x} y={730} s={0.7} ash={p.ash} f={p.f} />)}
  </g>
);

// 15. Ranger station on Quarry Ridge (outside) and inside
const RangerOutside: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="ranger" />
    <path d="M -200 1300 L -200 760 Q 600 640 1300 700 L 2200 760 L 2200 1300 Z" fill={mix("#7e8f62", "#8d8984", p.ash * 0.85)} {...O} />
    <g transform="translate(1180 860)">
      <rect x={-300} y={-300} width={600} height={300} fill={mix("#a8774d", "#8f8a83", p.ash * 0.5)} {...O} />
      {[...Array(6)].map((_, i) => <line key={i} x1={-300} y1={-250 + i * 50} x2={300} y2={-250 + i * 50} {...thin} />)}
      <path d="M -340 -300 L 0 -470 L 340 -300 Z" fill={mix("#4f6b45", "#77726c", p.ash * 0.6)} {...O} />
      <rect x={-60} y={-200} width={120} height={200} fill="#5b3a26" {...thin} />
      <rect x={140} y={-230} width={110} height={90} fill="#9fc4dd" {...thin} />
      <rect x={-200} y={-344} width={400} height={44} fill="#2f4a2a" {...thin} />
      <text x={0} y={-312} textAnchor="middle" fontSize={30} fontWeight={900} fill="#f2e3b0" fontFamily="sans-serif">QUARRY RIDGE</text>
      <line x1={260} y1={-300} x2={260} y2={-520} stroke={INK} strokeWidth={6} />
    </g>
    <Ground y={870} color="#7e8f62" ash={p.ash} id="ranger-g" />
  </g>
);
const RangerInside: React.FC<PlaceProps> = (p) => (
  <g>
    <Room wall="#b9946a" floor="#7d5a3c" floorY={880} ash={p.ash * 0.4} id="rin">
      {[...Array(14)].map((_, i) => <line key={i} x1={-200} y1={-200 + i * 80} x2={2200} y2={-200 + i * 80} stroke="#000" strokeOpacity={0.1} strokeWidth={4} />)}
      <rect x={260} y={220} width={420} height={300} fill="#f3e2b0" {...O} />
      <path d="M 290 420 Q 380 300 470 380 T 650 300" stroke="#3b7dd8" strokeWidth={6} fill="none" />
      <InWindow x={1320} y={240} w={320} h={260} tod={p.tod} ash={p.ash} f={p.f} falling={p.ash > 0 ? 0.6 : 0} id="rin" curtains={false} />
      <Shelf x={800} y={360} w={380} items={["box", "can", "can", "box"]} f={p.f} />
    </Room>
    <rect x={760} y={640} width={520} height={30} fill="#8a5d39" {...O} />
    <rect x={780} y={670} width={24} height={210} fill="#6e4a2e" {...thin} /><rect x={1236} y={670} width={24} height={210} fill="#6e4a2e" {...thin} />
    {/* first-aid kit + radio on the desk */}
    <rect x={820} y={580} width={120} height={60} rx={6} fill="#fff" {...O} />
    <path d="M 880 592 V 628 M 862 610 H 898" stroke="#d63b3b" strokeWidth={10} />
    <rect x={1060} y={584} width={110} height={56} rx={8} fill="#c94f3a" {...O} />
  </g>
);

// 16. Ridge top above the grey valley (also the final blue-sky shot)
const RidgeTop: React.FC<PlaceProps> = (p) => (
  <g>
    <Sky tod={p.tod} ash={p.ash} id="ridge" />
    <Mountain x={1500} base={760} w={800} h={340} f={p.f} eruption={p.eruption} ash={p.ash} tod={p.tod} />
    <path d="M -200 760 Q 600 720 1200 760 T 2200 740 L 2200 1300 L -200 1300 Z" fill={mix("#8fa978", "#9b968f", p.ash * 0.9)} opacity={0.85} />
    <path d="M -200 1300 L -200 860 Q 300 780 760 820 Q 1200 860 1500 900 L 2200 940 L 2200 1300 Z" fill={mix("#8c7a5e", "#8b867f", p.ash * 0.7)} {...O} />
    {[...Array(8)].map((_, i) => <ellipse key={i} cx={100 + i * 240} cy={940 + (i % 3) * 30} rx={40} ry={22} fill="#7d7770" {...thin} />)}
  </g>
);

export const PLACES: Record<string, PlaceDef> = {
  valley:            { C: Valley, floorY: 960, charX: 400, dogX: 520, scale: 0.4, outdoor: true, label: "Ember Valley from above" },
  farmhouse:         { C: Farmhouse, floorY: 965, charX: 640, dogX: 1000, scale: 0.72, outdoor: true, label: "Nico's farmhouse, outside" },
  road:              { C: Farmhouse, floorY: 1030, charX: 900, dogX: 1060, scale: 0.82, outdoor: true, label: "The road in front of the farmhouse" },
  living_room:       { C: LivingRoom, floorY: 900, charX: 560, dogX: 760, scale: 1, outdoor: false, label: "Living room" },
  kitchen:           { C: Kitchen, floorY: 900, charX: 820, dogX: 600, scale: 1, outdoor: false, label: "Kitchen" },
  back_yard:         { C: BackYard, floorY: 900, charX: 900, dogX: 1150, scale: 0.92, outdoor: true, label: "Back yard with covered rain barrel" },
  hallway:           { C: Hallway, floorY: 900, charX: 900, dogX: 1100, scale: 1, outdoor: false, label: "Hallway (front door)" },
  workshop:          { C: Workshop, floorY: 900, charX: 1200, dogX: 1460, scale: 1, outdoor: false, label: "Workshop / shed" },
  bedroom:           { C: Bedroom, floorY: 900, charX: 1000, dogX: 1450, scale: 1, outdoor: false, label: "Bedroom with the ruler on the windowsill" },
  bedroom_collapsed: { C: BedroomBroken, floorY: 900, charX: 1500, dogX: 1700, scale: 1, outdoor: false, label: "Collapsed bedroom" },
  porch:             { C: Porch, floorY: 875, charX: 900, dogX: 1150, scale: 0.95, outdoor: true, label: "Porch" },
  garden:            { C: Garden, floorY: 930, charX: 900, dogX: 1250, scale: 0.85, outdoor: true, label: "Vegetable garden" },
  pantry:            { C: Pantry, floorY: 900, charX: 900, dogX: 1200, scale: 1, outdoor: false, label: "Pantry" },
  front_door:        { C: FrontDoor, floorY: 875, charX: 600, dogX: 820, scale: 0.95, outdoor: true, label: "Front door with the note" },
  town_street:       { C: TownStreet, floorY: 1000, charX: 700, dogX: 900, scale: 0.72, outdoor: true, label: "Grey town street, empty" },
  riverbed:          { C: Riverbed, floorY: 960, charX: 900, dogX: 1080, scale: 0.78, outdoor: true, label: "Dry riverbed in the valley" },
  hillside:          { C: Hillside, floorY: 840, charX: 1400, dogX: 1560, scale: 0.72, outdoor: true, label: "Hillside above the valley" },
  ranger_station:    { C: RangerOutside, floorY: 960, charX: 600, dogX: 780, scale: 0.75, outdoor: true, label: "Ranger station on Quarry Ridge, outside" },
  ranger_inside:     { C: RangerInside, floorY: 900, charX: 600, dogX: 400, scale: 1, outdoor: false, label: "Ranger station, inside" },
  ridge_top:         { C: RidgeTop, floorY: 930, charX: 760, dogX: 940, scale: 0.75, outdoor: true, label: "Ridge top" },
};
