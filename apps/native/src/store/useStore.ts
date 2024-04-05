import create from './createImmerStore';

const createValue = (props, set, value) => ({
    value,
    ...props,
    setValue: value => {
        set(state => {
            state.value = value;
        });
    },
});

const useStore = create((set, get) => ({
    states: new Map(),
    addState: (id, value) => {
        // Set method passed to child passes the user itself as state.
        const childSet = fn => {
            set(state => {
                fn(state.states.get(id));
            });
        };
        const remove = () => {
            set(state => {
                state.states.delete(id);
            });
        };
        const newUser = createValue({ remove }, childSet, value);
        set(state => {
            state.states.set(id, newUser);
        });
    },
    getStates: () => Array.from(get().states.values()),
    updateState: (id, value) => {
        get().states.get(id).setValue(value);
    },
    fetchAction: async (url, stateId) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            get().states.get(stateId).setValue(data.results);
        } catch (_error) {}
    },
}));

export default useStore;
