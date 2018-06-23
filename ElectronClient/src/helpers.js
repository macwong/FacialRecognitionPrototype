export default class Helpers {
    static getIndividualPredictionInfo(info, pred_name) {
        for (var pred in info) {
            let train_name = info[pred].name;
            
            if (train_name === pred_name) {
                return info[pred];
            }
        }
    
        return null;
    }
}

