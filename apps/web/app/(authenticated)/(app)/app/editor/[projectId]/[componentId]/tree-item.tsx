'use client';
import { SimpleTreeItemWrapper, TreeItemComponentProps } from 'dnd-kit-sortable-tree';
import { forwardRef } from 'react';
import useEditor, { ElementNode } from './useEditor';

/*
 * Here's the component that will render a single row of your tree
 */
export const TreeItemComponent = forwardRef<HTMLDivElement, TreeItemComponentProps<ElementNode>>((props, ref) => {
    const { activeItem, updateTab, updateActiveItem, clearActiveItem } = useEditor();

    const handleSetActiveItem = (item: ElementNode) => {
        if (item.id === 'background-dummy') {
            return;
        }

        if (item.id === activeItem) {
            clearActiveItem();
            updateTab('frames');
            return;
        }

        updateActiveItem(item.id);
        updateTab('styles');
    };

    return (
        /* you could also use FolderTreeItemWrapper if you want to show vertical lines.  */
        <SimpleTreeItemWrapper {...props} ref={ref}>
            <div
                className='h-full flex-1'
                style={
                    props.item.id === activeItem
                        ? {
                              color: 'rgb(59 130 246)',
                          }
                        : undefined
                }
                onClick={e => {
                    e.stopPropagation();
                    handleSetActiveItem({ ...props.item });
                }}>
                {props.item.value}
            </div>
        </SimpleTreeItemWrapper>
    );
});

TreeItemComponent.displayName = 'TreeItemComponent';
