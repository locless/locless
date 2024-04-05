import { create } from 'zustand';
import { enableMapSet, produce } from 'immer';

enableMapSet();

// Turn the set method into an immer proxy
const immer = config => (set, get, api) => config(fn => set(produce(fn)), get, api);

export default children => create(immer(children));
