export default class Helpers {
    static get pngSource() {
        return "data:image/png;base64,"; 
    }

    static getIndividualPredictionInfo(info, pred_name) {
        for (var pred in info) {
            let train_name = info[pred].name;
            
            if (train_name === pred_name) {
                return info[pred];
            }
        }
    
        return null;
    }

    
    static getRating(distance) {
        if (distance < 0.75) {
            return 5;
        }
        else if (distance < 0.9) {
            return 4;
        }
        else if (distance < 1.05) {
            return 3;
        }
        else if (distance < 1.2) {
            return 2;
        }
        else {
            return 1;
        }
    }

    static getPredictionIcon(distance) {
        if (distance < 0.75) {
            return "../images/verified.png";
        }
        else if (distance < 0.9) {
            return "../images/like.png";
        }
        else if (distance < 1.05) {
            return "../images/maybe.png";
        }
        else if (distance < 1.2) {
            return "../images/noidea.png";
        }
        else {
            return "../images/rotten.png";
        }
    }
}
