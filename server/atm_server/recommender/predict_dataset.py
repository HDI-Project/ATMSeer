import atm_server.recommender.metafeatures as metafeatures
import pandas as pd
import math
import numpy as np
import os
class Recommender:
    # Read Datasets.
    def __init__(self,saved_meta_path):
        self.feature_list = ['NumberOfInstancesWithMissingValues', 'ClassProbabilitySTD',  'NumberOfInstances', 'LogNumberOfFeatures', 'RatioNumericalToNominal', 'NumberOfMissingValues', 
                    'DatasetRatio', 'LogDatasetRatio', 'NumberOfNumericFeatures', 
                    'NumberOfFeaturesWithMissingValues', 'LogNumberOfInstances',
                    'SymbolsSum', 'KurtosisMax', 'ClassProbabilityMin', 'KurtosisMin',
                    'KurtosisSTD',   'NumberOfFeatures',  'SkewnessSTD',  'PercentageOfInstancesWithMissingValues',
                    'SkewnessMean', 'SymbolsMin', 'ClassProbabilityMean', 'SkewnessMax', 
                    'PercentageOfFeaturesWithMissingValues', 'NumberOfCategoricalFeatures',
                    'PercentageOfMissingValues', 'RatioNominalToNumerical', 'ClassEntropy',
                    'InverseDatasetRatio', 'SymbolsSTD',   'ClassProbabilityMax', 'SymbolsMax',
                    'KurtosisMean', 'SkewnessMin', 'NumberOfClasses', 'SymbolsMean']
        self.features = set(self.feature_list)
        self.column_title =  ["dataset_name"] + self.feature_list
        self.pre_meta_path = './server/recommender_dataset/data_meta_first.csv' 
        self.pre_PMA_path = './server/recommender_dataset/dataset_method_PMA.csv'
        self.saved_meta_path = saved_meta_path
        if not os.path.exists(self.saved_meta_path):
            os.makedirs(self.saved_meta_path)

    def getSavedDataMetaPath(self,dataset_name):
        return self.saved_meta_path + "/data_meta_"+str(dataset_name)+".csv"

    def getSavedResultPath(self,dataset_name):
        return self.saved_meta_path + "/data_result_"+str(dataset_name)+".csv"

    def calculate_dataset(self,path_to_dataset,dataset_name):
        '''
        calculate the train dataset meta information.
        '''
        # Read Train Dataset
        dataset_train_path = path_to_dataset
        dataset = pd.read_csv(dataset_train_path)
        
        # Dataset Feature Title
        dataset_feature = dataset.columns.values
        dataset_feature = dataset_feature.tolist()
        dataset_feature.remove('class')


        num_col = dataset.shape[1]
        X = dataset[dataset_feature]
        y = dataset[['class']]
        X = X.values
        y = y.values

        categoricals = [type(X[0,j]) is str for j in range(num_col-1)]
        result = metafeatures.calculate_all_metafeatures(X,y,categoricals,dataset_name,self.features)
        result_array = []
        result_array.append(dataset_name)
        for name in self.feature_list:
            data = str(result.metafeature_values[name].value)
            result_array.append(data)
        df2 = pd.DataFrame([result_array], columns=self.column_title)
        df2.to_csv(self.getSavedDataMetaPath(dataset_name))
        


    def calculate_l1_dataset(self,dataset_name):
        '''
        According to the meta information, predict the result of methods ranking.
        '''
        # l1 - distance
        def L1(v1,v2):
            if len(v1)!=len(v2):
                print("l1 distance calculated error")
                return -1
            return sum([abs(v1[i]-v2[i]) for i in range(len(v1))])
        # Read Pre computed meta information
        df3 = pd.read_csv(self.pre_meta_path)
        df4 = pd.read_csv(self.getSavedDataMetaPath(dataset_name))
        num = df3.shape[0]
        this_feature = df4.loc[0,self.feature_list].tolist()
        min_value = 0
        min_index = -1
        value_index = []
        # Calculate L1 distance
        for i in range(num):
            index = i
            row_feature = df3.loc[i,self.feature_list].tolist()
            value = L1(this_feature,row_feature)
            value_index+=[{"index":index,"value":value}]
            if min_index == -1 or min_value>value:
                min_value = value
                min_index = i
        value_index.sort(key = lambda a: a["value"])  
        # Use Knn methods   
        k = 10
        index_list = [value_index[i]["index"] for i in range(k)]
        # Fetch the corresponding datasets
        result_name = df3.loc[index_list,"dataset_name"]
        df5 = pd.read_csv(self.pre_PMA_path)
        title = ['method','name','PMA']
        title2 = ['value']
        df6 = pd.DataFrame([],columns=title+title2)
        # name column is replaced by the l1 distance
        base_value = value_index[0]["value"]
        # Construct the PMA datasets
        for i in range(k):
            cor_name = result_name.at[index_list[i]]
            cor_value = base_value / value_index[i]["value"]
            result = df5.loc[df5['name'] == cor_name]
            result = result.sort_values(by=['PMA'],ascending=False)
            result = result[title]
            length = len(result)
            df7 = pd.DataFrame([cor_value]*length,columns=title2)
            df7.index = result.index
            df8 = result.join(df7)
            df6 = pd.concat([df6,df8])
        # Calculate Weighted Average
        # df6.to_csv("./data_result_"+dataset_name+".csv")
        result2 = df6.groupby(df6.method).apply(lambda x: np.average(x.PMA, weights=x.value))
        result2 = result2.sort_values(ascending=False)
        # print(df6)
        
        result2.to_csv(self.getSavedResultPath(dataset_name))

    def predict_dataset(self,predict_dataset_path,datasetID):
        result_path = self.getSavedResultPath(str(datasetID))
        computed = os.path.exists(result_path)
        if not computed:
            self.calculate_dataset(predict_dataset_path,datasetID)
            self.calculate_l1_dataset(datasetID)
            computed = os.path.exists(result_path)
            if not computed:
                raise ValueError("Fail to compute predict dataset")
        df9 = pd.Series.from_csv(result_path)
        #print(df9)
        result3 = df9.index.tolist()
        result3 = [str1[len('classify_'):len(str1)] for str1 in result3]
        result3 = [str1  for str1 in result3 if not str1 == 'dbn']
        return result3


