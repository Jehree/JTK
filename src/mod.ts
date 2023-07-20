import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";

//import other .ts files
import { traderTweaks } from "./trader-tweaker";
import { equipmentSlotsTweaks } from "./equipment-slots-tweaker";
import { caseTweaks } from "./case-tweaker";
import { questRewardTweaks } from "./quest-reward-tweaker";

class Mod implements IPostAkiLoadMod, IPostDBLoadMod {
    private config = require("../config/config.json")
    logger: ILogger
    modName: string
    modVersion: string
    container: DependencyContainer;

    public postAkiLoad(container: DependencyContainer): void {
        this.container = container
    }

    postDBLoad(container: DependencyContainer): void {
        this.modName = "Jehree's Toolkit"


        const Trader_Tweaker = new traderTweaks()
        const Equipment_Slots_Tweaker = new equipmentSlotsTweaks()
        const Case_Tweaker = new caseTweaks()
        const Quest_Reward_Tweaker = new questRewardTweaks()
 
        this.logger = container.resolve<ILogger>("WinstonLogger")
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil")
        const hashUtil = container.resolve<HashUtil>("HashUtil")
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
        const dbTables = databaseServer.getTables()
        const dbItems = dbTables.templates.items

        this.logger.log(`[${this.modName}] : Mod loading`, "magenta")

        this.compatibilityThings(dbTables)

        if (this.config.trader_tweaks){
            this.logger.log(`TOOL: Barter Tweaker enabled and loading...`, "yellow")

            Trader_Tweaker.runtime(dbTables, this.logger, hashUtil)

            this.logger.log(`...done!`, "cyan")
        } else {this.logger.log(`TOOL: Barter Tweaker disabled.`, "yellow")}

        if (this.config.equipment_slots_tweaks){
            this.logger.log(`TOOL: Equipment Slots Tweaker enabled and loading...`, "yellow")

            Equipment_Slots_Tweaker.runtime(dbItems)

            this.logger.log(`...done!`, "cyan")
        } else {this.logger.log(`TOOL: Equipment Slots Tweaker disabled.`, "yellow")}

        if (this.config.remove_item_filters_by_parent_id.enabled){
            this.logger.log(`Removing item filters by parent id...`, "yellow")
            
            this.removeGridFiltersByParent(dbItems, this.logger)

            this.logger.log(`...done!`, "cyan")
        }

        if (this.config.case_tweaks){
            this.logger.log(`TOOL: Case Editor enabled and loading...`, "yellow")

            Case_Tweaker.runtime(dbItems, this.logger, jsonUtil)

            this.logger.log(`...done!`, "cyan")
        } else {this.logger.log(`TOOL: Case Editor disabled.`, "yellow")}
        
        if (this.config.quest_reward_tweaks){
            this.logger.log(`TOOL: Quest Reward Editor enabled and loading...`, "yellow")

            Quest_Reward_Tweaker.runtime(dbTables, this.logger, hashUtil)

            this.logger.log(`...done!`, "cyan")
        } else {this.logger.log(`TOOL: Quest Reward Editor disabled.`, "yellow")}

        this.logger.log(`[${this.modName}] : Loaded! Hooray!`, "magenta");
    }

    removeGridFiltersByParent(databaseItems, logger){

        const parentIdsToUse = this.config.remove_item_filters_by_parent_id.parent_ids

        for (const item in databaseItems){

            if (parentIdsToUse.includes(databaseItems[item]._parent)){

                const gridsElement = databaseItems[item]._props?.Grids

                for (const g in gridsElement){
                    gridsElement[g]._props.filters[0]["Filter"] = ["54009119af1c881c07000029"]
                    gridsElement[g]._props.filters[0]["ExcludedFilter"] = [""]
                }
            }
        }
        logger.log("Items with these parent id's have had their item filters removed: " + parentIdsToUse, "cyan")
    }

    compatibilityThings(dbTables){
        //do a compatibility correction to make this mod work with other mods with destructive code (cough, SVM, cough)
        //basically just add the filters element back to backpacks, secure containers, rigs, and simple containers if they've been removed by other mods
        const compatFiltersElement = [{ "Filter": [BaseClasses.ITEM], "ExcludedFilter": [""] }];

        for (let i in dbTables.templates.items){
           if(
            dbTables.templates.items[i]._parent === BaseClasses.BACKPACK ||
            dbTables.templates.items[i]._parent === BaseClasses.VEST ||
            dbTables.templates.items[i]._parent === "5448bf274bdc2dfc2f8b456a" /*Mob Container ID*/ ||
            dbTables.templates.items[i]._parent === BaseClasses.SIMPLE_CONTAINER
            ){
                if(dbTables.templates.items[i]._props.Grids[0]._props.filters[0] === undefined){
                    dbTables.templates.items[i]._props.Grids[0]._props.filters = compatFiltersElement;
                }
            }
        }

    }
}

module.exports = { mod: new Mod() }