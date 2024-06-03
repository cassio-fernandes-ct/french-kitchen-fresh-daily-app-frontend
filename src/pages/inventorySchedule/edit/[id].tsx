import ButtonEnd from '@/Components/ButtonEnd';
import { Box, Card, Text, TextField, Button, Toast, Divider, Icon, Select, Modal,  LegacyCard, LegacyStack,    Collapsible, Link } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/plugins/axios';
import { DatePicker } from '@shopify/polaris';
import DateTimePicker from '@/Components/DateTimePicker';


import {
    MobileBackArrowMajor
} from '@shopify/polaris-icons'; 
import { useRouter } from 'next/router';
import QuillJs from '@/Components/QuillJs';
import IngredientGroupModal from '@/Components/IngredientGroupModal';

export default function EditLocations() {

    const [values, setValues] = useState({})
    const [errors, setErrors] = useState({})
    const [active, setActive] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date())

    const [isLoading, setIsLoading] = useState(true)

    const [clearValue, setClearValue] = useState(false);
    const router = useRouter();
    const processId = router.query.id
    const initialData = {
        monday: { timeslots: { delivery: [], pickup: [] } },
        tuesday: { timeslots: { delivery: [], pickup: [] } },
        wednesday: { timeslots: { delivery: [], pickup: [] } },
        thursday: { timeslots: { delivery: [], pickup: [] } },
        friday: { timeslots: { delivery: [], pickup: [] } },
        saturday: { timeslots: { delivery: [], pickup: [] } },
        sunday: { timeslots: { delivery: [], pickup: [] } },
      };

    // Order of days from Monday to Sunday
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    
    /************************************************** */
   
    const [timeslot_config_data, setTimeslotData] = useState(initialData);
    // setTimeslotData(initialData);

    const [open, setOpen] = useState({ monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false });
    const [deliveryGroupOpen, setDeliveryGroupOpen] = useState(false);
    const [pickUpGroupOpen, setPickUpGroupOpen] = useState(false);
  
    const handleToggle = (day) => {
      setOpen((prevOpen) => ({ ...prevOpen, [day]: !prevOpen[day] }));
    };
  
    const handleDeliveryToggle = () => {
      setDeliveryGroupOpen((prevOpen) => !prevOpen);
    };
  
    const handlePickUpToggle = () => {
      setPickUpGroupOpen((prevOpen) => !prevOpen);
    };
  
    const handleChange = useCallback((day, type, index, field, value) => {
         
        setTimeslotData((prevData) => {
           const newData = { ...prevData };
          if (newData[day].timeslots && newData[day].timeslots[type]) {
            newData[day].timeslots[type][index][field] = value;
            console.log('New data:', newData[day]);
            console.log('All data:', newData);

          }
          return newData;
        });
        
        setValues((prevValues) => ({
            ...prevValues,
            'timeslot_config_data': timeslot_config_data
          }));
          console.log('new vals - ', values);
        
    }, [ values, timeslot_config_data]);
  
      const addDeliverySlot = (day) => {
        setTimeslotData((prevData) => {
          const newData = { ...prevData };
          const newSlot = { slot_start: '', slot_end: '', order_limit: null };
          if (!newData[day].timeslots) {
            newData[day].timeslots = {};
          }
          if (!newData[day].timeslots.delivery) {
            newData[day].timeslots.delivery = [];
          }
          newData[day].timeslots.delivery.push(newSlot);
          return newData;
        });
        
      };
  
      const addPickupSlot = (day) => {
        setTimeslotData((prevData) => {
          const newData = { ...prevData };
          const newSlot = { slot_start: '', slot_end: '', order_limit: null };
          if (!newData[day].timeslots) {
            newData[day].timeslots = {};
          }
          if (!newData[day].timeslots.pickup) {
            newData[day].timeslots.pickup = [];
          }
          newData[day].timeslots.pickup.push(newSlot);
          return newData;
        });
      };
     
    /****************************************************************************/
    useEffect(() => {
        if (processId) {

            axiosInstance.get(`/api/inventorySchedule/${processId}`).then((response) => {
                const dt = response.data;

                const mergedData = { ...initialData, ...dt.timeslot_config };

                setTimeslotData( mergedData);
                setValues({
                    quantity: dt.quantity,
                    is_active: dt.is_active == 1 ? 1 : 0,
                    overwrite_stock: dt.overwrite_stock == 1 ? 1 : 0,
                    stock_datetime: (new Date(dt.stock_datetime)).toISOString().split("T")[0],
                    recurring_config: dt.recurring_config ? dt.recurring_config : '',
                    variant_config: dt.variant_config ? dt.variant_config : ''
                })
                
                setIsLoading(false)
            })
        }
    }, [processId])

    const onValuesChange = (value, name, index) => {
        setValues((prevValue) => {
            let valueBkp = { ...prevValue }
            valueBkp[name] = value

            return valueBkp
        })
    }

    

    const toastMarkup = active ? (
        <Toast content="Schedule Edited Successfully!" onDismiss={() => {
            setActive(false)
        }} />
    ) : null;

    const onSaveAndKeepEditingHandler = useCallback(() => {
      
        axiosInstance.put(`/api/inventorySchedule/${processId}`, values).then((response) => {
            setErrors({})
            setActive(true)
        }).catch((response) => {
            const error = response.response.data.errors
            const err = {}
            Object.keys(error).map((key) => {
                err[key] = <ul key={key} style={{ margin: 0, listStyle: 'none', padding: 0 }}>
                    {error[key].map((message, index) => {
                        let splitedKey = key.split('.');
                        let fieldTitle = splitedKey[splitedKey.length - 1].replace('_', ' ')

                        if (splitedKey.length > 1) {
                            return <li key={index} style={{ margin: 0 }}>{message.replace(key, fieldTitle)}</li>
                        } else {
                            return <li key={index} style={{ margin: 0 }}>{message}</li>
                        }
                    })}
                </ul>
            })

            setErrors({ ...err })
        })
    }, [values])

    const onClickActionHandler = useCallback(() => {
          console.log("all vlues = ", values)

        axiosInstance.put(`/api/inventorySchedule/${processId}`, values).then((response) => {
            //window.location.href = `/inventorySchedule`
        }).catch((response) => {
            const error = response.response.data.errors
            const err = {}
            Object.keys(error).map((key) => {
                err[key] = <ul key={key} style={{ margin: 0, listStyle: 'none', padding: 0 }}>
                    {error[key].map((message, index) => {
                        let splitedKey = key.split('.');
                        let fieldTitle = splitedKey[splitedKey.length - 1].replace('_', ' ')

                        if (splitedKey.length > 1) {
                            return <li key={index} style={{ margin: 0 }}>{message.replace(key, fieldTitle)}</li>
                        } else {
                            return <li key={index} style={{ margin: 0 }}>{message}</li>
                        }
                    })}
                </ul>
            })

            setErrors({ ...err })
        })
    }, [values])

    return (<Box minHeight='100vh' maxWidth="100%" as='section' background="bg">
        {/* <Frame> */}
        <div style={{ maxWidth: "70%", display: 'flex', justifyContent: 'center', margin: '25px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Card padding={800} >
                <div style={{ width: '4000px', maxWidth: '100%' }}>
                    <a className='back-button' href='/inventorySchedule' style={{ position: 'absolute', display: 'flex', textDecoration: 'none' }}>
                        <Icon
                            source={MobileBackArrowMajor}
                            tone="base"
                        /><span> Back</span>
                    </a>
                    <div style={{ marginBottom: "10px" }}>
                        <Text variant="heading3xl" alignment="center" as={'h1'} >Edit inventory Schedule</Text>
                    </div>
                    <div style={{ marginBottom: "10px", display: 'flex', justifyContent: 'end' }} >
                        <div style={{ width: '100%', display: 'flex' }}>
                            <div style={{ width: '33%', padding: '15px' }}>
                                <TextField
                                    name='quantity'
                                    label="Quantity"
                                    error={errors.quantity}
                                    value={values.quantity}
                                    error={errors.quantity}
                                    autoComplete="off"
                                    onChange={(value) => {
                                        onValuesChange(value, 'quantity')
                                    }}
                                />
                            </div> 
                            <div style={{ width: '33%', padding: '15px' }}>
                                <input
                                        type="radio"
                                        name="is_active"
                                        value="1"
                                        error={errors.is_active}
                                        checked={values.is_active === 1}
                                        onChange={(value) => {
                                            onValuesChange(1, 'is_active')
                                        }}
                                    />
                                    <label htmlFor="is_active">True</label>

                                    <input
                                        type="radio"
                                        name="is_active"
                                        value="0"
                                        error={errors.is_active}
                                        checked={values.is_active === 0}
                                        onChange={(value) => {
                                            onValuesChange(0, 'is_active')
                                        }}
                                    />
                                    <label htmlFor="no_active">False</label>
                            </div>
                            <div style={{ width: '33%', padding: '15px' }}>
                            <input
                                    type="radio"
                                    name="overwrite_stock"
                                    value="1"
                                    error={errors.overwrite_stock}
                                    checked={values.overwrite_stock === 1}
                                    onChange={(value) => {
                                        onValuesChange(1, 'overwrite_stock')
                                    }}
                                />
                                <label htmlFor="overwrite_stock">True</label>

                                <input
                                    type="radio"
                                    name="overwrite_stock"
                                    value="0"
                                    error={errors.overwrite_stock}
                                    checked={values.overwrite_stock === 0}
                                    onChange={(value) => {
                                        onValuesChange(0, 'overwrite_stock')
                                    }}
                                />
                                <label htmlFor="no_overwrite_stock">False</label>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginBottom: "10px", display: 'flex', justifyContent: 'end' }} >
                        <div style={{ width: '100%', display: 'flex' }}>
                             
                            <div style={{ width: '25%', padding: '15px' }}>
                                <TextField
                                    label="Stock DateTime"
                                    name="stock_datetime"
                                    type='date'
                                    value={values.stock_datetime}
                                    error={errors.stock_datetime}
                                    onChange={(value) => {
                                        onValuesChange(value, 'stock_datetime')
                                    }}
                                />
                                {/* <DateTimePicker
                                    label="Stock DateTime"
                                    name="stock_datetime"
                                    type='date'
                                    value={values.stock_datetime}
                                    error={errors.stock_datetime}
                                    onChange={(value) => {
                                        onValuesChange(value, 'stock_datetime')
                                    }}
                                /> */}
                                
                                {/* <TextField
                                    label="Time"
                                    type="time"
                                    value={time}
                                    onChange={handleTimeChange}
                                    autoComplete="off"
                                /> */}
                                 
                            </div>
                             
                        </div>
                    </div>
 
                    {daysOrder.map((day) => (
                    <div key={day}>
                    <Button onClick={() => handleToggle(day)} ariaExpanded={open[day]} ariaControls={`${day}-collapsible`}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Button>
                    <br />
                    <Collapsible open={open[day]} id={`${day}-collapsible`} transition={{ duration: '500ms', timingFunction: 'ease-in-out' }} expandOnPrint>
                        <div style={{ marginBottom: "10px", display: 'flex', justifyContent: 'end' }}>
                        <div style={{ width: '100%', display: 'flex' }}>
                            <div style={{ width: '50%', padding: '15px', margin: '10px', border: '1px solid #E3E3E3' }}>
                            <center>Delivery</center>
                            <center>
                                <Button onClick={() => addDeliverySlot(day)} ariaExpanded={deliveryGroupOpen} ariaControls="delivery-config-new-group">
                                Add New Time Slot
                                </Button>
                            </center>
                            {timeslot_config_data[day].timeslots && timeslot_config_data[day].timeslots.delivery && timeslot_config_data[day].timeslots.delivery.map((slot, index) => (
                                <div key={index}>
                                <div style={{ width: '100%', display: 'flex' }}>
                                    <div style={{ width: '50%', padding: '15px' }}>
                                    <TextField
                                        label="Slot Start"
                                        type='text'
                                        value={slot.slot_start}
                                        autoComplete="off"
                                        onChange={(value) => handleChange(day, 'delivery', index, 'slot_start', value)}
                                    />
                                    </div>
                                    <div style={{ width: '50%', padding: '15px' }}>
                                    <TextField
                                        label="Slot End"
                                        type='text'
                                        value={slot.slot_end}
                                        autoComplete="off"
                                        onChange={(value) => handleChange(day, 'delivery', index, 'slot_end', value)}
                                    />
                                    </div>
                                </div>
                                <div style={{ width: '100%', display: 'flex' }}>
                                    <div style={{ width: '100%', padding: '15px' }}>
                                    <TextField
                                        label="Order Limit"
                                        type='number'
                                        value={slot.order_limit !== null ? slot.order_limit : ''}
                                        autoComplete="off"
                                        onChange={(value) => handleChange(day, 'delivery', index, 'order_limit', value)}
                                    />
                                    </div>
                                </div>
                                </div>
                            ))}
                            </div>
                            <div style={{ width: '50%', padding: '15px', margin: '10px', border: '1px solid #E3E3E3' }}>
                            <center>Pick Up</center>
                            <center>
                                <Button onClick={() => addPickupSlot(day)} ariaExpanded={pickUpGroupOpen} ariaControls="pickUp-config-new-group">
                                Add New Time Slot
                                </Button>
                            </center>
                            {timeslot_config_data[day].timeslots && timeslot_config_data[day].timeslots.pickup && timeslot_config_data[day].timeslots.pickup.map((slot, index) => (
                                <div key={index}>
                                <div style={{ width: '100%', display: 'flex' }}>
                                    <div style={{ width: '50%', padding: '15px' }}>
                                    <TextField
                                        label="Slot Start"
                                        type='text'
                                        value={slot.slot_start}
                                        autoComplete="off"
                                        onChange={(value) => handleChange(day, 'pickup', index, 'slot_start', value)}
                                    />
                                    </div>
                                    <div style={{ width: '50%', padding: '15px' }}>
                                    <TextField
                                        label="Slot End"
                                        type='text'
                                        value={slot.slot_end}
                                        autoComplete="off"
                                        onChange={(value) => handleChange(day, 'pickup', index, 'slot_end', value)}
                                    />
                                    </div>
                                    
                                </div>
                                <div style={{ width: '100%', display: 'flex' }}>
                                    <div style={{ width: '100%', padding: '15px' }}>
                                    <TextField
                                        label="Order Limit"
                                        type='number'
                                        value={slot.order_limit !== null ? slot.order_limit : ''}
                                        autoComplete="off"
                                        onChange={(value) => handleChange(day, 'pickup', index, 'order_limit', value)}
                                    />
                                    </div>
                                </div>
                            </div>
                            ))}
                            </div>
                        </div>
                        </div>
                    </Collapsible>
                    </div>
                ))}

                    <Divider borderColor="border" />
                                        
                    <div style={{ marginBottom: "10px", marginTop: "10px", display: 'flex', justifyContent: 'end' }} >
                        <div style={{ marginRight: '10px' }}><Button loading={active} onClick={onSaveAndKeepEditingHandler}>Save & Keep Editing</Button></div>
                        <Button loading={active} onClick={onClickActionHandler}>Save</Button>
                    </div> 
                    {/* <ButtonEnd onClickAction={onClickActionHandler} buttonName="Create Ingredient" /> */}
                </div>
            </Card>
            {toastMarkup}
        </div>
        {/* </Frame> */}
    </Box>)
}