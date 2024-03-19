'use client';
import { Button } from '@repo/ui/components/ui/button';
import { useToast } from '@repo/ui/components/ui/use-toast';
import React from 'react';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import useEditor, { ElementNode, ElementProp, ElementStyle } from './useEditor';
import { useMutation } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';

interface Props {
    componentId: Id<'components'>;
}

interface IStyles {
    id: string;
    styles: {
        varId?: Id<'variables'> | undefined;
        type: 'var' | 'custom' | 'outside';
        name: string;
        value: string;
    }[];
}

interface IProps {
    id: string;
    props: {
        varId?: Id<'variables'> | undefined;
        translationId?: Id<'translations'> | undefined;
        name: string;
        type: 'var' | 'custom' | 'translation' | 'outside';
        value: string;
    }[];
}

export const SaveNodeButton = ({ componentId }: Props) => {
    const createNodeMutation = useMutation(api.node.save);
    const addDummyPropMutation = useMutation(api.node.addDummyProp);
    const removeNode = useMutation(api.node.deleteSingle);

    const { toast } = useToast();

    const {
        componentsData,
        isSaveAllowed,
        dummyPropsId,
        dummyProps,
        loadDummyPropsId,
        updateSaveButton,
        loadComponentsData,
    } = useEditor();

    const transformStyles = (styles?: Record<string, Record<string, ElementStyle>>) => {
        if (!styles) {
            return;
        }

        let array: IStyles[] = [];

        Object.entries(styles).forEach(item => {
            array.push({
                id: item[0],
                styles: Object.values(item[1]),
            });
        });

        return array;
    };

    const transformProps = (props?: Record<string, Record<string, ElementProp>>) => {
        if (!props) {
            return;
        }

        let array: IProps[] = [];

        Object.entries(props).forEach(item => {
            array.push({
                id: item[0],
                props: Object.values(item[1]),
            });
        });

        return array;
    };

    const transformLayout = (layout?: ElementNode[]) => {
        if (!layout) {
            return;
        }

        let array: ElementNode[] = [];

        layout.forEach(item => {
            array.push({
                id: item.id,
                value: item.value,
                canHaveChildren: item.canHaveChildren,
                connectionId: item.connectionId,
                children: transformLayout(item.children),
            });
        });

        return array;
    };

    const handleSaveNode = async () => {
        if (!componentsData.layout) {
            return;
        }

        if (componentsData.layout.length === 0 && componentsData.nodeId) {
            await removeNode({
                nodeId: componentsData.nodeId,
            });
            updateSaveButton(false);
            loadComponentsData({ ...componentsData, nodeId: undefined });
            toast({
                description: 'Your element has been saved!',
            });
        } else {
            const nodeId = await createNodeMutation({
                componentId,
                environment: 'dev',
                nodeId: componentsData.nodeId,
                styles: transformStyles(componentsData.styles),
                props: transformProps(componentsData.props),
                layout: transformLayout(componentsData.layout) as ElementNode[],
                meta: Object.values(componentsData.meta),
                outsideProps: componentsData.outsideProps,
            });

            if (nodeId) {
                updateSaveButton(false);
                loadComponentsData({ ...componentsData, nodeId });
                toast({
                    description: 'Your element has been saved!',
                });

                const savedDummyPropId = await addDummyPropMutation({
                    nodeId,
                    props: dummyProps,
                    dummyPropId: dummyPropsId,
                });

                if (savedDummyPropId) {
                    if (dummyProps?.length) {
                        loadDummyPropsId(savedDummyPropId);
                    }

                    updateSaveButton(false);
                    toast({
                        description: 'Dummy props have been saved!',
                    });
                }
            }
        }
    };

    return (
        <Button
            type='button'
            onClick={handleSaveNode}
            disabled={!isSaveAllowed || (componentsData.layout.length === 0 && !componentsData.nodeId)}>
            Save
        </Button>
    );
};
