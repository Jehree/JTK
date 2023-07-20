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

export class questRewardTweaks{

    private questRewardsFolder = "/config/Tools/Quest Reward Edits/";


    runtime(tables, logger, hashUtil){
        const Filepath_Getter = new filePathGetter()

        //get arr of filenames in the folder
        let questRewardsFilenames = Filepath_Getter.getArrOfFileNames(this.questRewardsFolder)

        //for each filename...
        for (let filename in questRewardsFilenames){

            //...get the file itself
            let questRewardsFile = require(questRewardsFilenames[filename])
            for (const removal in questRewardsFile.Removals){
                this.pullReward(questRewardsFile.Removals[removal].items_to_remove, tables, questRewardsFile.Removals[removal].quest_name)
            }

            for (const newReward in questRewardsFile.New_Rewards){
                this.pushReward(questRewardsFile.New_Rewards[newReward], tables, hashUtil)

            }

            logger.log(`${questRewardsFilenames[filename]} loaded!!`, "cyan")
        }
    }

    pullReward(removeTheseItems:string[], tables, questName){
        const dbQuests = tables.templates.quests
        

        //loop thru quests
        for (const quest in dbQuests){
            //if the trader id of the quest matches, or we are removing from all traders, do the thing
            if ((dbQuests[quest].QuestName === questName) || (questName === "all_quests")){
                const successArr = dbQuests[quest].rewards.Success

                //loop thru current quest success rewards
                for (const suc in successArr){

                //loop thru current success reward's items (if items array exists)
                //don't need to do an undefined check here because the loop won't 
                //iterate over an undefined variable.
                    for (const item in successArr[suc].items){
                        const sucItemID = successArr[suc].items[item]?._tpl

                        //for each item, loop thru config removal items
                        for (const itemRemoval in removeTheseItems){

                            //if config removal item matches the quest item, delete that bih
                            if (removeTheseItems[itemRemoval] === sucItemID && successArr[suc].type === "Item"){
                                //remove the quest reward
                                successArr.splice(suc, 1)
                            }
                        }
                    }
                }
            }
        }
    }

    pushReward(config, tables, hashUtil){
        const dbQuests = tables.templates.quests

        //get trader ID from the trader name
        let traderID = config.trader
        Object.entries(traderIDs).forEach(([key, val]) => {
            if (key === traderID){
                traderID = val
            }
        })

        for (const quest in dbQuests){

            if((dbQuests[quest].traderId === traderID) && (dbQuests[quest].QuestName === config.quest_name)){
                const successArr = dbQuests[quest].rewards.Success

                successArr.push(this.awardConstructor(config.item_id, config.amount, successArr.length-1, hashUtil))
            }
        }
    }

    awardConstructor(itemID, amount, index, hashUtil){

        const idForTarget = hashUtil.generate()

        return {
            "findInRaid": true,
            "id": hashUtil.generate(),
            "index": index,
            "items": [
                {
                "_id": idForTarget,
                "_tpl": itemID,
                "upd": {
                    "StackObjectsCount": amount
                }
                }
            ],
            "target": idForTarget,
            "type": "Item",
            "value": amount.toString()
        }
    }

}