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
        type: 'var' | 'custom';
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
        type: 'var' | 'custom' | 'translation';
        value: string;
    }[];
}

export const SaveNodeButton = ({ componentId }: Props) => {
    const createNodeMutation = useMutation(api.node.save);
    const { toast } = useToast();

    const { componentsData, isSaveAllowed, updateSaveButton } = useEditor();

    const transformStyles = (styles: Record<string, Record<string, ElementStyle>>) => {
        let array: IStyles[] = [];

        Object.entries(styles).forEach(item => {
            array.push({
                id: item[0],
                styles: Object.values(item[1]),
            });
        });

        return array;
    };

    const transformProps = (props: Record<string, Record<string, ElementProp>>) => {
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
        const nodeId = await createNodeMutation({
            componentId,
            environment: 'dev',
            nodeId: componentsData.nodeId,
            styles: transformStyles(componentsData.styles),
            props: transformProps(componentsData.props),
            layout: transformLayout(componentsData.layout),
            meta: Object.values(componentsData.meta),
        });

        if (nodeId) {
            updateSaveButton(false);
            toast({
                description: 'Your element has been created!',
            });
        }
    };

    return (
        <Button type='button' onClick={handleSaveNode} disabled={!isSaveAllowed}>
            Save
        </Button>
    );
};
