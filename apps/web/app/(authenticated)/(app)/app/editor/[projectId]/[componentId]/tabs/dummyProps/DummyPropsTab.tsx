'use client';
import { Button } from '@repo/ui/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Label } from '@repo/ui/components/ui/label';
import { Input } from '@repo/ui/components/ui/input';
import { TabsContent } from '@repo/ui/components/ui/tabs';
import { CopyButton } from '@/components/dashboard/copy-button';
import useEditor, { DummyProp } from '../../useEditor';
import { DummyPropSearch } from './dummy-props-search';
import { OutsidePropType, outsidePropTypeArray } from '@repo/backend/constants';
import { RadioGroupDropdown } from '@/components/radio-group-dropdown';

export default function DummyPropsTab() {
    const { componentsData, dummyProps, loadDummyProps, updateSaveButton } = useEditor();

    const handleUpdateDummyPropsValue = (propTag: string, value: string | undefined) => {
        if (dummyProps && value !== '') {
            let newProps: DummyProp[] | undefined = [...(dummyProps ?? [])];

            if (value === undefined) {
                newProps = newProps.filter(p => p.name !== propTag);
                if (newProps.length === 0) {
                    newProps = undefined;
                }
            } else {
                const propIndex = newProps.findIndex(p => p.name === propTag);

                if (propIndex !== -1) {
                    (newProps[propIndex] as any).value = value;
                }
            }

            loadDummyProps(newProps);
            updateSaveButton(true);
        }
    };

    const handleUpdateDummyPropsType = (propTag: string, value: OutsidePropType) => {
        if (dummyProps) {
            let newProps = [...(dummyProps ?? [])];

            const propIndex = newProps.findIndex(p => p.name === propTag);

            if (propIndex !== -1) {
                (newProps[propIndex] as any).type = value;
            }

            loadDummyProps(newProps);
        }
    };

    const handleOnChosen = (value: string, type: OutsidePropType) => {
        let newProps = [...(dummyProps ?? [])];

        newProps.push({
            name: value,
            value: '',
            type,
        });

        loadDummyProps(newProps);
    };

    return (
        <TabsContent value='dummyProps'>
            {componentsData.outsideProps?.length ? (
                <>
                    <div className='flex items-center gap-4 mt-3 mb-6 justify-between'>
                        <h5 className='scroll-m-20 text-xl font-semibold tracking-tight text-black mr-auto'>
                            DummyProps
                        </h5>
                        <DummyPropSearch onChosen={handleOnChosen} />
                    </div>
                    {dummyProps?.length
                        ? dummyProps.map(prop => (
                              <div key={prop.name} className='flex gap-4 items-center mb-4'>
                                  <Label htmlFor={`dummyProp_${prop.name}`} className='text-black'>
                                      {prop.name}
                                  </Label>
                                  <Input
                                      id={`dummyProp_${prop.name}`}
                                      value={prop.value}
                                      className='col-span-3 text-black'
                                      onChange={e => {
                                          handleUpdateDummyPropsValue(prop.name, e.currentTarget.value);
                                      }}
                                  />
                                  <RadioGroupDropdown
                                      activeValue={{
                                          _id: prop.type,
                                          name: prop.type,
                                      }}
                                      values={outsidePropTypeArray.map(p => {
                                          return { _id: p, name: p };
                                      })}
                                      onChange={value => {
                                          handleUpdateDummyPropsType(prop.name, value.name as OutsidePropType);
                                      }}
                                  />
                                  <div className='w-6 h-6'>
                                      <CopyButton value={prop.value} />
                                  </div>
                                  <Button onClick={() => handleUpdateDummyPropsValue(prop.name, undefined)}>
                                      <Trash2 size={18} className='w-4 h-4 ' />
                                  </Button>
                              </div>
                          ))
                        : null}
                </>
            ) : (
                <p className='text-black text-center'>
                    Seems like you didn&apos;t add any outside props.
                    <br /> You can add outside props via clicking on Add Prop button.
                </p>
            )}
        </TabsContent>
    );
}
