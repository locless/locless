'use client';
import { Button } from '@repo/ui/components/ui/button';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useConvex, useQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { notFound } from 'next/navigation';
import { Loading } from '@/components/dashboard/loading';
import { SortableTree, TreeItems } from 'dnd-kit-sortable-tree';
import { Label } from '@repo/ui/components/ui/label';
import { Input } from '@repo/ui/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import useEditor, { ElementNode, TabType } from './useEditor';
import { PropsValues, StylesValues, deviceFrames } from './constants';
import { StyleSearch } from './style-search';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { TreeItemComponent } from './tree-item';
import { AppRegistry } from 'react-native-web';
import ReactNativeApp from './react-native-app';
import { useEffect } from 'react';
import { PropSearch } from './prop-search';
import { CopyButton } from '@/components/dashboard/copy-button';

interface Props {
    params: {
        projectId: Id<'projects'>;
        componentId: Id<'components'>;
    };
}

export default function EditorPage(props: Props) {
    const component = useQuery(api.component.getSingle, {
        projectId: props.params.projectId,
        componentId: props.params.componentId,
    });

    const convex = useConvex();

    const {
        componentsData,
        activeTabType,
        frameItem,
        activeItem,
        updateTab,
        clearActiveItem,
        updateFrameItem,
        updateProps,
        updateStyles,
        updateLayout,
        loadComponentsData,
        updateSaveButton,
    } = useEditor();

    const handleDeviceClick = (device: { title: string; width: number; height: number }) => {
        localStorage.setItem('frameItemTitle', device.title);
        updateFrameItem({
            id: 'background-dummy',
            value: 'Frame',
            type: 'view',
            props: {},
            styles: {
                width: device.width,
                height: device.height,
                backgroundColor: 'white',
                overflow: 'hidden',
            },
        });
    };

    const handleChangeTree = (items: TreeItems<ElementNode>) => {
        updateSaveButton(true);
        updateLayout(items);
    };

    const handleUpdateActiveItemStyles = (styleTag: string, value: string | undefined) => {
        if (activeItem && frameItem) {
            let newStyles = { ...componentsData.styles[activeItem] };

            if (value === undefined) {
                delete newStyles[styleTag];
            } else {
                newStyles = {
                    ...newStyles,
                    [styleTag]: { ...(newStyles[styleTag] ?? { name: styleTag, type: 'custom' }), value },
                };
            }

            updateStyles(activeItem, newStyles);
            updateSaveButton(true);
        }
    };

    const handleOnStyleChosen = (value: string) => {
        const chosenStyle = StylesValues[value];

        if (!chosenStyle) {
            return;
        }

        handleUpdateActiveItemStyles(chosenStyle.tag, chosenStyle.defaultValue);
    };

    const onStyleRemove = (value: string) => {
        const chosenStyle = StylesValues[value.toLowerCase()];

        if (!chosenStyle) {
            return;
        }

        handleUpdateActiveItemStyles(chosenStyle.tag, undefined);
    };

    const handleUpdateActiveItemProps = (propTag: string, value: string | undefined) => {
        if (activeItem && frameItem) {
            let newProps = { ...componentsData.props[activeItem] };

            if (value === undefined) {
                delete newProps[propTag];
            } else {
                newProps = {
                    ...newProps,
                    [propTag]: { ...(newProps[propTag] ?? { name: propTag, type: 'custom' }), value },
                };
            }

            updateProps(activeItem, newProps);
            updateSaveButton(true);
        }
    };

    const handleOnPropChosen = (value: string) => {
        const chosenProp = PropsValues[value];

        if (!chosenProp) {
            return;
        }

        handleUpdateActiveItemProps(chosenProp.tag, chosenProp.defaultValue);
    };

    const onPropRemove = (value: string) => {
        const chosenProp = PropsValues[value.toLowerCase()];

        if (!chosenProp) {
            return;
        }

        handleUpdateActiveItemProps(chosenProp.tag, undefined);
    };

    const transformMeta = (array?: any[]) => {
        let obj = {};

        if (array) {
            array.forEach(item => {
                obj = { ...obj, [item.id]: item };
            });
        }

        return obj;
    };

    const transformSubArrays = (array?: any[]) => {
        let obj = {};

        if (array) {
            array.forEach(item => {
                obj = { ...obj, [item.name]: item };
            });
        }

        return obj;
    };

    const transformStyles = (array?: any[]) => {
        let obj = {};

        if (array) {
            array.forEach(item => {
                obj = { ...obj, [item.id]: transformSubArrays(item.styles) };
            });
        }

        return obj;
    };

    const transformProps = (array?: any[]) => {
        let obj = {};

        if (array) {
            array.forEach(item => {
                obj = { ...obj, [item.id]: transformSubArrays(item.props) };
            });
        }

        return obj;
    };

    const loadNode = async () => {
        const node = await convex.query(api.node.getSingle, {
            projectId: props.params.projectId,
            componentId: props.params.componentId,
            environment: 'dev',
        });

        if (node) {
            const newData = {
                nodeId: node._id,
                meta: transformMeta(node.meta),
                layout: node.layout as ElementNode[],
                props: transformProps(node.props),
                styles: transformStyles(node.styles),
            };

            loadComponentsData(newData);
        }

        const savedFrameTitle = localStorage.getItem('frameItemTitle');
        const frameDevice = deviceFrames.find(d => d.title === savedFrameTitle);

        if (frameDevice) {
            updateFrameItem({
                id: 'background-dummy',
                value: 'Frame',
                type: 'view',
                props: {},
                styles: {
                    width: frameDevice.width,
                    height: frameDevice.height,
                    backgroundColor: 'white',
                    overflow: 'hidden',
                },
            });
        }

        updateTab('frames');
        clearActiveItem();

        AppRegistry.registerComponent('App', () => ReactNativeApp);
        AppRegistry.runApplication('App', { rootTag: document.getElementById('react-native-app') });
    };

    useEffect(() => {
        if (component) {
            loadNode();
        }
    }, [component]);

    if (component === null) {
        return notFound();
    }

    if (component === undefined) {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    const Controls = () => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
        return (
            <div className='absolute right-2 top-2 z-40 flex items-center gap-2'>
                <Button onClick={() => zoomIn()}>
                    <Plus size={18} className='w-4 h-4 ' />
                </Button>
                <Button onClick={() => zoomOut()}>
                    <Minus size={18} className='w-4 h-4 ' />
                </Button>
                <Button onClick={() => resetTransform()}>Reset</Button>
            </div>
        );
    };

    return (
        <div className='flex flex-1 justify-between max-w-full max-h-full'>
            <div className='flex flex-col w-72'>
                <div className='flex items-center justify-between pb-4 pr-4'>
                    <h4 className='scroll-m-20 text-xl font-semibold tracking-tight text-black'>Components</h4>
                </div>
                <SortableTree
                    items={componentsData.layout}
                    onItemsChanged={handleChangeTree}
                    TreeItemComponent={TreeItemComponent}
                />
            </div>
            <div className='flex flex-1 bg-cyan-100 items-center justify-center overflow-hidden relative'>
                <TransformWrapper>
                    <Controls />
                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                        <div id='react-native-app' style={{ width: '100%', height: '100%' }}></div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
            <div className='flex flex-col w-96 pl-4'>
                <Tabs
                    defaultValue='frames'
                    value={activeTabType}
                    onValueChange={value => {
                        updateTab(value as TabType);
                    }}
                    className='w-full'>
                    <TabsList className='flex'>
                        <TabsTrigger value='frames' className='flex-1'>
                            Frames
                        </TabsTrigger>
                        <TabsTrigger value='styles' className='flex-1'>
                            Styles
                        </TabsTrigger>
                        <TabsTrigger value='interactions' className='flex-1'>
                            Interactions
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='frames' className='flex gap-2 flex-wrap'>
                        {deviceFrames.map(device => {
                            return (
                                <Button
                                    key={device.title}
                                    disabled={device.title === localStorage.getItem('frameItemTitle')}
                                    onClick={() => handleDeviceClick(device)}>
                                    {device.title}
                                </Button>
                            );
                        })}
                    </TabsContent>
                    <TabsContent value='styles'>
                        {activeItem ? (
                            <>
                                <div className='flex items-center gap-4 mt-3 mb-6 justify-between'>
                                    <h5 className='scroll-m-20 text-xl font-semibold tracking-tight text-black mr-auto'>
                                        Styles of {componentsData.meta[activeItem]?.name}
                                    </h5>
                                    <StyleSearch onStyleChosen={handleOnStyleChosen} />
                                </div>
                                {Object.entries(componentsData.styles[activeItem] ?? []).map(style => (
                                    <div key={style[0]} className='flex gap-4 items-center mb-4'>
                                        <Label htmlFor={`styles_${style[0]}`} className='text-black'>
                                            {style[0]}
                                        </Label>
                                        <Input
                                            id={`styles_${style[0]}`}
                                            value={style[1].value}
                                            className='col-span-3 text-black'
                                            onChange={e => {
                                                handleUpdateActiveItemStyles(style[0], e.currentTarget.value);
                                            }}
                                        />
                                        <div className='w-6 h-6'>
                                            <CopyButton value={style[1].value} />
                                        </div>
                                        <Button onClick={() => onStyleRemove(style[0])}>
                                            <Trash2 size={18} className='w-4 h-4 ' />
                                        </Button>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className='text-black text-center'>
                                Seems like you didn&apos;t choose active component.
                                <br /> You can select any element simply by clicking on it in UI demo.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value='interactions'>
                        {activeItem ? (
                            <>
                                <div className='flex items-center gap-4 mt-3 mb-6 justify-between'>
                                    <h5 className='scroll-m-20 text-xl font-semibold tracking-tight text-black mr-auto'>
                                        Props of {componentsData.meta[activeItem]?.name}
                                    </h5>
                                    <PropSearch onPropChosen={handleOnPropChosen} />
                                </div>
                                {Object.entries(componentsData.props[activeItem] ?? []).map(prop => (
                                    <div key={prop[0]} className='flex gap-4 items-center mb-4'>
                                        <Label htmlFor={`props_${prop[0]}`} className='text-black'>
                                            {prop[0]}
                                        </Label>
                                        <Input
                                            id={`props_${prop[0]}`}
                                            value={prop[1].value}
                                            className='col-span-3 text-black'
                                            onChange={e => {
                                                handleUpdateActiveItemProps(prop[0], e.currentTarget.value);
                                            }}
                                        />
                                        <div className='w-6 h-6'>
                                            <CopyButton value={prop[1].value} />
                                        </div>
                                        <Button onClick={() => onPropRemove(prop[0])}>
                                            <Trash2 size={18} className='w-4 h-4 ' />
                                        </Button>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className='text-black text-center'>
                                Seems like you didn&apos;t choose active component.
                                <br /> You can select any element simply by clicking on it in UI demo.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
