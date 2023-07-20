import * as path from 'path';
import * as fs from 'fs';

export class filePathGetter{
    modPath: string = path.normalize(path.join(__dirname, '..'));

    getArrOfFileNames(folderPath){

        let filePaths = []  

        fs.readdirSync(this.modPath + folderPath).forEach(file => {
            if(path.extname(file) === ".json"){

                let newPath = ".." + folderPath+file
                filePaths.push(newPath)
            }
          });
          return filePaths;
      }
}