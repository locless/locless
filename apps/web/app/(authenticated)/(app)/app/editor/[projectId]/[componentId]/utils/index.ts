const transformSubArrays = (array?: any[]) => {
    let obj = {};

    if (array) {
        array.forEach(item => {
            obj = { ...obj, [item.name]: item };
        });
    }

    return obj;
};

export const transformMeta = (array?: any[]) => {
    let obj = {};

    if (array) {
        array.forEach(item => {
            obj = { ...obj, [item.id]: item };
        });
    }

    return obj;
};

export const transformStyles = (array?: any[]) => {
    let obj = {};

    if (array) {
        array.forEach(item => {
            obj = { ...obj, [item.id]: transformSubArrays(item.styles) };
        });
    }

    return obj;
};

export const transformProps = (array?: any[]) => {
    let obj = {};

    if (array) {
        array.forEach(item => {
            obj = { ...obj, [item.id]: transformSubArrays(item.props) };
        });
    }

    return obj;
};
