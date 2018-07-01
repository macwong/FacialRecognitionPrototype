import Globals from './globals';
import path from 'path';
import $ from 'jquery';

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

    static getProbability(probability) {
        let prob = probability * 100;
        prob = prob.toFixed(2);
        return prob + "%";
    }

    static clearOverlay($resultsOverlay) {
        $resultsOverlay.stop(true).css('opacity', '0.0');
    }

    static fadeStuff($resultsOverlay) {
        $resultsOverlay.fadeTo(7500, 1.0);
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    
    static getModels($select) {
        var deferred = $.Deferred();
    
        $.ajax({
            url: path.join(Globals.endpoint, "getmodels"),
            type: "GET",
            dataType:"json"
        }).done((result) => {
            $select.empty();
    
            for (var i = 0; i < result.models.length; i++) {
                let $option = $("<option></option>");
                $option.text(result.models[i]);
                $option.val(result.models[i]);
                $select.append($option);
            }
    
            deferred.resolve();
        });
    
        return deferred.promise();
    }
}

