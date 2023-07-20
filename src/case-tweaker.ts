import { filePathGetter } from "./filepath-getter";


export class caseTweaks{
    private caseEditsConfigFolder = "/config/Tools/Case Edits/"

    runtime(databaseItems, logger, jsonUtil){
        const Filepath_Getter = new filePathGetter ()

        let caseEditsFiles = Filepath_Getter.getArrOfFileNames(this.caseEditsConfigFolder)
        for (let file in caseEditsFiles){

            let currentCaseTweak = require(caseEditsFiles[file])

            for (const tweak in currentCaseTweak.Cases){

                if (this.idIsValid(databaseItems, currentCaseTweak.Cases[tweak])){
                    this.resizeContainer(databaseItems, currentCaseTweak.Cases[tweak], jsonUtil)
                    this.editContainerFilters(databaseItems, currentCaseTweak.Cases[tweak])
                }
            }
            logger.log(`${caseEditsFiles[file]} loaded!!`, "cyan")
        }  
    }

    resizeContainer (databaseItems, currentItem, jsonUtil){
        let itemID = currentItem.id
        let hCells = currentItem.H_Cells
        let vCells = currentItem.V_Cells
        let externalSizeH = currentItem.External_Size_H
        let externalSizeV = currentItem.External_Size_V

        let dbGridsElement = databaseItems[itemID]._props.Grids

        //change external size
        if(externalSizeH !== undefined){databaseItems[itemID]._props.Width = externalSizeH}
        if(externalSizeV !== undefined){databaseItems[itemID]._props.Height = externalSizeV}

        if(
        (hCells !== undefined) &&
        (vCells !== undefined) &&
        (hCells.length === vCells.length)){

            for(let i = 0; i < vCells.length; i++){

                //get copy of grid[0] element to edit
                let gridsElementCopy = jsonUtil.clone(dbGridsElement[0])

                //update the name, id, h and v cell values from the copied grid element
                gridsElementCopy._name += (i+1);
                gridsElementCopy._id += (i+1);
                gridsElementCopy._props.cellsH = hCells[i];
                gridsElementCopy._props.cellsV = vCells[i];

                //push a copy of gridsElementCopy to server
                if (dbGridsElement[i] === undefined){
                    dbGridsElement.push(jsonUtil.clone(gridsElementCopy));
                } else {
                    dbGridsElement[i] = jsonUtil.clone(gridsElementCopy);
                }
            }
        }
    }

    editContainerFilters (databaseItems, currentItem){
        let itemID = currentItem.id
        let ALLinFilter = currentItem.Included_Filter
        let ALLexFilter = currentItem.Excluded_Filter
        let ALLfiltOverwrite = currentItem.Filter_Overwrite
        let UCfiltOverwrite = currentItem.Unique_Cell_Filter_Overwrite
        let UCcellToApply = currentItem.Cell_To_Apply_Unique_Filter_To ?? 0
        let UCinFilter = currentItem.Unique_Included_Filter
        let UCexFilter = currentItem.Unique_Excluded_Filter

        let dbGridsElement = databaseItems[itemID]._props.Grids

        for (let i = 0; i < dbGridsElement.length; i++){
            let currentFiltOverwrite;
            let currentInFilt:string[];
            let currentExFilt:string[];

            //check if the current iteration needs a unique filter
            if(i == UCcellToApply-1 || UCcellToApply[i] == "y"){
                currentFiltOverwrite = UCfiltOverwrite;
                currentInFilt = UCinFilter;
                currentExFilt = UCexFilter;
            } else {
                currentFiltOverwrite = ALLfiltOverwrite;
                currentInFilt = ALLinFilter;
                currentExFilt = ALLexFilter;
            }

            if(currentFiltOverwrite == true && currentInFilt[0] == ""){
                currentInFilt[0] = "54009119af1c881c07000029";
            }    

            if (currentFiltOverwrite !== undefined){
                let dbfiltersElement = dbGridsElement[i]._props.filters

                //push included filters
                if ((currentFiltOverwrite == true) || (dbfiltersElement[0].Filter === undefined)) {

                    dbfiltersElement[0]["Filter"] = [...currentInFilt];

                } else {dbfiltersElement[0].Filter.push(...currentInFilt);}
                
                //push excluded filters
                if ((currentFiltOverwrite == true) || (dbfiltersElement[0].ExcludedFilter === undefined)) {

                    dbfiltersElement[0]["ExcludedFilter"] = [...currentExFilt];

                } else {dbfiltersElement[0].ExcludedFilter.push(...currentExFilt);}
            }
        }
    }

    idIsValid (databaseItems, currentItem){
        if(databaseItems[currentItem.id] === undefined){
            return false;
        } else {
            return true;
        }
    }

}