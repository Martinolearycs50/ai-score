'use client';
import {
 useState };
 from 'react';
import type {
 PillarScores };
 from '@/lib/types';
  interface DynamicWeightIndicatorProps {

weights: Record<keyof PillarScores,
number>;
pageType: string;
};
 const PILLAR_INFO: Record<keyof;
PillarScores,
  {
name:
string;
icon:
string;
color:
string
}
> = {
  RETRIEVAL: {
name: 'Speed & Access',
icon: '⚡',
color: 'var(--accent)'
},
  FACT_DENSITY: {
name: 'Information Richness',
icon: '📊',
color: 'var(--primary)'
},
  STRUCTURE: {
name: 'Content Organization',
icon: '🏗️',
color: 'var(--success)'
},
  TRUST: {
name: 'Credibility',
icon: '🛡️',
color: 'var(--warning)'
},
  RECENCY: {
name: 'Freshness',
icon: '🌱',
color: 'var(--journey)' }

};
  export default function DynamicWeightIndicator({
weights,
pageType }
: DynamicWeightIndicatorProps) {
const [showDetails,
setShowDetails] = useState(false);
// Calculate total weight to show percentage const totalWeight = Object.values(weights).reduce((sum,
weight) => sum + weight, 0);
return ( <div;
className="bg-gray-50;
rounded-lg;
p-4;
border;
border-default"> <div;
className="flex;
items-center;
justify-between;
mb-3"> <div> <h4;
className="text-sm;
font-medium;
text-foreground">Dynamic Scoring Active</h4> <p className="text-xs text-body mt-0.5"> Weights adjusted for {
pageType};
 pages </p> </div> <button onClick={
() => setShowDetails(!showDetails)};
 className="text-sm text-accent hover: font-medium" style={
{
 color: "var(--accent)" }
}
 > {
showDetails ? 'Hide' : 'Show'};
 weights </button> </div> {
  showDetails && ( <div className="space-y-2 mt-4"> {
  (Object.keys(weights) as Array<keyof PillarScores>).map((pillar) => {
const weight = weights[pillar];
const percentage = Math.round((weight / totalWeight) * 100);
const info = PILLAR_INFO[pillar];
return ( <div;
key={
pillar};
className="flex;
items-center;
gap-3"> <span className="text-lg w-6 text-center">{
info.icon}
</span> <div className="flex-1"> <div;
className="flex;
items-center;
justify-between;
mb-1"> <span;
className="text-xs;
font-medium;
text-body">{
info.name}
</span> <span className="text-xs text-muted">{
weight};
 pts ({
percentage}
%)</span> </div> <div;
className="h-2;
rounded-full;
overflow-hidden"
  style={
{
backgroundColor:
'var(--gray-200)'
}
}
> <div;
  className={
`h-full;
bg-${
info.color}
-500;
transition-all;
duration-300`};
  style={
{
width:
`${
percentage}
%`
}
}

/> </div> </div> </div> );
})}
 <div;
className="mt-3;
pt-3;
border-t;
border-default"> <div;
className="flex;
items-center;
justify-between;
text-xs"> <span className="font-medium text-body">Total Points</span> <span className="font-bold text-foreground">{
totalWeight}
</span> </div> </div> </div> )}
 </div> );
}
