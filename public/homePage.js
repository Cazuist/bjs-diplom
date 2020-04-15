'use strict';
//логаут текущего пользователя
const userLogout = new LogoutButton();

userLogout.action = () => 
	ApiConnector.logout( response => {
    if (response.success) {
      location.reload();
    }
  });

//загрузка данных текущего пользователя
ApiConnector.current( response => {
  if (response.success) {
    ProfileWidget.showProfile(response.data);
  }
});

//загрузка курсов валют
const board = new RatesBoard();

setInterval(ApiConnector.getStocks(response => {
  if(response.success) {
    board.clearTable();
    board.fillTable(response.data);
  }
}), 60000);

//реализация операций с деньгами
const manager = new MoneyManager();

//пополнение балланса
manager.addMoneyCallback = (currencyObj) => {
  ApiConnector.addMoney(currencyObj, response => {
    const message = !response.success ? response.data :
            `Кошелек успешно пополнен на ${currencyObj.amount} ${currencyObj.currency}.`;

    manager.setMessage(response.success, message);
    if(response.success) {
      ProfileWidget.showProfile(response.data); 
    }    
  });     
};

//конвертация валют
manager.conversionMoneyCallback = (convertObj) => {
  ApiConnector.convertMoney(convertObj, response => {
    const message = !response.success ? response.data :
        `Успешно конвертировано ${convertObj.fromAmount} ${convertObj.fromCurrency} в ${convertObj.targetCurrency}`;

    manager.setMessage(response.success, message);
    if(response.success) {
      ProfileWidget.showProfile(response.data); 
    }    
  });     
};

//перевод валюты
manager.sendMoneyCallback = (transfObj) => {
  ApiConnector.transferMoney(transfObj, response => {
    const message = !response.success ? response.data :
        `Совершен перевод ${transfObj.amount} ${transfObj.currency}.
        ID получателя ${transfObj.to}.`;

    manager.setMessage(response.success, message);

    if(response.success) {
      ProfileWidget.showProfile(response.data); 
    }   
  });     
};

//избранное
const favorite = new FavoritesWidget();

ApiConnector.getFavorites( (response) => {
  if(response.success) {
    favorite.clearTable();
    favorite.fillTable(response.data);
    manager.updateUsersList(response.data);
  }  
}) 

favorite.addUserCallback = (data) => {
  ApiConnector.addUserToFavorites(data, response => {    
    if(response.success) {
      favorite.clearTable();
      favorite.fillTable(response.data);
      manager.updateUsersList(response.data);
    } else {      
      favorite.setMessage(response.success, response.data);
    }
  });
};

favorite.removeUserCallback = (id) => {
  ApiConnector.removeUserFromFavorites(id, response => {    
    if(response.success) {
      favorite.clearTable();
      favorite.fillTable(response.data);
      manager.updateUsersList(response.data);
    } else {      
      favorite.setMessage(response.success, response.data);
    }
  });
};