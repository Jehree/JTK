


export class equipmentSlotsTweaks{
    private equipmentSlotsConfig = require("../config/tools/Equipment Slots.json");

    runtime(databaseItems){
        const configItems = this.equipmentSlotsConfig.EquipmentSlots

        for (let item in configItems){
            let currentItem = configItems[item] //setup a currentItem object to pull params from

            this.editSlotFilters(databaseItems, currentItem);

            //step 1: loop thru items table slot array checking for name and when you find it return the index that it is in
            //step 2: prooooofit
            //step 3: split profits with Eve 50/50 but she has to lick my toe
        }  

    }

    editSlotFilters(databaseItems, currentItem){
        let slotsItemID
        if (
            currentItem.Name == "SpecialSlot1" ||
            currentItem.Name == "SpecialSlot2" ||
            currentItem.Name == "SpecialSlot3"
            ){
                if(databaseItems["CustomPocket"] !== undefined){
                    slotsItemID = "CustomPocket";
                } else {
                    slotsItemID = "627a4e6b255f7527fb05a0f6";
                }
            } else {
                slotsItemID = "55d7217a4bdc2d86028b456d";
            }


        const slotName = currentItem.Name
        const filtOverwrite = currentItem.Filter_Overwrite
        const inFilt = currentItem.Included_Filter
        const exFilt = currentItem.Excluded_Filter


        let slotsElement = databaseItems[slotsItemID]._props.Slots;

        let slotFilterKey;

        for (let i = 0; i < slotsElement.length; i++){
            if (slotsElement[i]._name == slotName){
                slotFilterKey = i;
            }
        }

        if(filtOverwrite == true && inFilt[0] == ""){
            inFilt[0] = "54009119af1c881c07000029";
        }

        //push included filters to slot
        if ((filtOverwrite == true) || (slotsElement[slotFilterKey]._props.filters[0].Filter === undefined)) {

            slotsElement[slotFilterKey]._props.filters[0]["Filter"] = [...inFilt];

        } else {slotsElement[slotFilterKey]._props.filters[0].Filter.push(...inFilt);}


        //push excluded filters to slot
        if ((filtOverwrite == true) || (slotsElement[slotFilterKey]._props.filters[0].ExcludedFilter === undefined)) {

            slotsElement[slotFilterKey]._props.filters[0]["ExcludedFilter"] = [...exFilt];

        } else {slotsElement[slotFilterKey]._props.filters[0].ExcludedFilter.push(...exFilt);}
    }



}