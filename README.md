# Задание 2: RandomWinner и TicketService

## Описание
В этом задании реализованы два смарт-контракта:
1. `RandomWinner` - контракт для простой азартной игры, где пользователи могут выиграть деньги на основе вероятности
2. `TicketService` - контракт для управления продажей билетов на мероприятие

### Контракт RandomWinner
Контракт RandomWinner позволяет:
- Делать ставки и пытаться выиграть с определенной вероятностью
- Настраивать параметры вероятности выигрыша
- Просматривать общую сумму средств в контракте
- Рассчитывать возможную сумму выигрыша

### Контракт TicketService
Контракт TicketService позволяет:
- Просматривать доступные билеты разных категорий
- Покупать билеты
- Проверять доступность конкретного билета
- Проверять владение билетом
- Получать список билетов конкретного владельца
- Добавлять новые билеты (только владельцу контракта)

## Инструкция по запуску
1. Установить зависимости:
```
npm install @openzeppelin/contracts@4.9.3
npm install @tw3/solidity@0.0.5
```

2. Запустить локальный блокчейн Ganache:
```
ganache-cli -p 8545
```

3. Скомпилировать контракты:
```
npx truffle compile
```

4. Развернуть контракты:
```
npx truffle migrate
```

5. Запустить тесты:
```
npx truffle test
```

6. Взаимодействовать с контрактами можно через консоль Truffle:
```
npx truffle console
```

В консоли:
```javascript
// Получить экземпляры контрактов
let randomWinner = await RandomWinner.deployed()
let ticketService = await TicketService.deployed()

// Добавить средства в контракт RandomWinner
await randomWinner.addFunds({ value: web3.utils.toWei("0.5", "ether") })

// Проверить общее количество средств
let totalAmount = await randomWinner.getTotalAmount()
console.log(web3.utils.fromWei(totalAmount.toString(), "ether"))

// Проверить доступные билеты
let availableTickets = await ticketService.getAvailableTickets()
console.log(availableTickets.length)

// Купить билет
await ticketService.buyTicket(accounts[0], "a1", { value: 100000 })
```

## Примечания по устранению проблем
Если у вас возникают проблемы с запуском проекта:

1. Проверьте версию Node.js (рекомендуется использовать LTS версию, например 18.x)
2. Убедитесь, что Ganache запущен на порту 8545
3. Если контракты не развертываются через Truffle, альтернативно можно использовать [Remix IDE](https://remix.ethereum.org/)

## Технические детали
- **Solidity 0.8.21** - язык программирования для смарт-контрактов
- **OpenZeppelin Contracts 4.9.3** - библиотека безопасных контрактов
- **@tw3/solidity 0.0.5** - утилиты для работы со строками