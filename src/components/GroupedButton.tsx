import { Button, ButtonGroup } from "@mui/material";
import React, { useEffect, useState } from "react";

const GroupedButtons: React.FC<{ 
    initialValue?: number, 
    valueChanged?: (valueChanged: number) => void,
    lowerBound?: number
}> = ({ initialValue, valueChanged, lowerBound }) => {
    const [value, setValue] = useState<number>(initialValue ?? 0);

    useEffect(() => {
        valueChanged?.(value);
    }, [value]);

    const increment = () => {
        setValue(num => num + 1);
    };

    const disableDecrement = lowerBound ? value <= lowerBound : false;
    const decrement = () => {
        setValue(num => num - 1);

    };
    const displayCounter = value > 0;

    return (
        <ButtonGroup size="small" aria-label="small outlined button group">
            {displayCounter && <Button disabled={disableDecrement} onClick={decrement}>-</Button>}
            {displayCounter && <Button disabled>{value}</Button>}
            <Button onClick={increment}>+</Button>
        </ButtonGroup>
    );
}

export default GroupedButtons;