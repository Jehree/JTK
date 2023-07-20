import { filePathGetter } from "./filepath-getter";

const traderIDs = {
    "mechanic": "5a7c2eca46aef81a7ca2145d",
    "skier": "58330581ace78e27b8b10cee",
    "peacekeeper": "5935c25fb3acc3127c3d8cd9",
    "therapist": "54cb57776803fa99248b456e",
    "prapor": "54cb50c76803fa8b248b4571",
    "jaeger": "5c0647fdd443bc2504c2d371",
    "ragman": "5ac3b934156ae10c4430e83c"
}

const currencyIDs = {
    "roubles": "5449016a4bdc2d6f028b456f",
    "euros": "569668774bdc2da2298b4568",
    "dollars": "5696686a4bdc2da3298b456a"
}

export class traderTweaks {

    private traderAssortEditsFolder = "/config/Tools/Trader Assortment Edits/";
    
    runtime(tables, logger, hashUtil){
        const Filepath_Getter = new filePathGetter()

        //get arr of filenames in the folder
        let assortEditFilenames:string[] = Filepath_Getter.getArrOfFileNames(this.traderAssortEditsFolder)
        
        //for each filename...
        for (let filename in assortEditFilenames){

            //...get the file itself
            let assortEditFile = require(assortEditFilenames[filename])

            for (const removal in assortEditFile.Removals){
                const config = assortEditFile.Removals[removal]
                this.pullFromTrader(config.items_to_remove, tables, removal)
            }

            for (const newBart in assortEditFile.New_Barters_Simple){
                const config = assortEditFile.New_Barters_Simple[newBart]
                this.pushToTrader(config, tables, "simple", hashUtil)
            }

            for (const newBart in assortEditFile.New_Barters_Complex){
                const config = assortEditFile.New_Barters_Complex[newBart]
                this.pushToTrader(config, tables, "complex", hashUtil)
            }

            logger.log(`${assortEditFilenames[filename]} loaded!!`, "cyan")
        }
    }

    pushToTrader(config, tables, simpOrComp, hashUtil){

        //add to config trader's inventory
        let traderToPushTo = config.trader;
        Object.entries(traderIDs).forEach(([key, val]) => {
            if (key === config.trader){
                traderToPushTo = val
            }
        })

        const trader = tables.traders[traderToPushTo]
        let assortId = config.assortment?._id ?? hashUtil.generate()

        if (simpOrComp === "complex"){
            trader.assort.items.push(config.assortment)

            if (config.barter_scheme !== undefined){
                const barterTrade: any = [];
                const configBarters = config.barter_scheme

                for (const barter in configBarters){
                    barterTrade.push(configBarters[barter])
                }

                trader.assort.barter_scheme[assortId] = [barterTrade]
            }
        } else if (simpOrComp === "simple") {
            let currency = config.currency
            Object.entries(currencyIDs).forEach(([key, val]) => {
                if (key === currency){
                    currency = val
                }
            })
  
            trader.assort.items.push(this.assortConstructor(config.item_id, assortId, config.unlimited, config.stock_amount))
            trader.assort.barter_scheme[assortId] = this.barterSchemeConstructor(currency, config.price)
        }

        if (config.trader_loyalty_level !== undefined){
            trader.assort.loyal_level_items[assortId] = config.trader_loyalty_level;
        }
    }

    assortConstructor(itemID:string, assortId: string, unlimited:boolean, stockAmount:number){
        return{
            "_id": assortId,
            "_tpl": itemID,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
              "StackObjectsCount": stockAmount,
              "UnlimitedCount": unlimited
            }
        }
    }

    barterSchemeConstructor(currency:string, price:number){
        return [
            [
                {
                  "count": price,
                  "_tpl": currency
                }
            ]
        ]
    }

    pullFromTrader(removeTheseItems, tables, traderKey){

        //get trader ID from the trader name
        let traderToPullFrom = traderKey
        Object.entries(traderIDs).forEach(([key, val]) => {
            if (key === traderKey){
                traderToPullFrom = val
            }
        })
        const trader = tables.traders[traderToPullFrom]
        const traderItems = trader.assort.items
        // sooooo I guess I don't need to remove the barter and LL objects?
        // if I have issues and need to revisit that, push the barter ids to an array and use that to delete them.

        //loop through trader assort items
        for (const it in traderItems){

            //for each item, loop through that trader's removal items from config
            for (const removal in removeTheseItems){

                if (traderItems[it]._tpl === removeTheseItems[removal]){
                    //delete the assort
                    traderItems[it] = {}
                }
            }
        }
    }

}