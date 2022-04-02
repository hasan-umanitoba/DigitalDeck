import { createStore } from 'vuex';
import axios from 'axios';
import UnitTests from './../scripts/UnitTests.js';
import { api_url } from "./../App.vue";

export default createStore({
    state: {
        sessionId: -1,
        playerId: -1,
        playerCards: null,
        tableCards: null,
        numCardsInDeck: -1,
        name: "",
        playersInfo: [], //other players name and number of cards
    },
    mutations: {
        setSessionId(state, sessionId) {
            state.sessionId = sessionId;
        },

        setPlayerId(state, playerId) {
            state.playerId = playerId;
        },

        setPlayerCards(state, playerCards) {
            state.playerCards = playerCards;
        },

        setTableCards(state, table) {
            state.tableCards = table.cards;
        },

        setCardsInDeck(state, deck) {
            state.numCardsInDeck = deck.length;
        },

        flipCard(state, card) {
            var index = state.tableCards.indexOf(card);
            state.tableCards[index] = -1 * state.tableCards[index];
        },

        setName(state, name) {
            state.name = name;
        },

        setPlayersInfo(state, players) {
            state.playersInfo = [];
            for (var i = 0; i < players.length; i++) {
                var obj = { name: players[i].name, numOfCards: players[i].cards.length };
                state.playersInfo.push(obj);
            }

        },

    },
    actions: {
        initSession({ commit, state }, sessionData) {
            return axios.post(api_url + '/session/new', {
                decks: sessionData.decks,
                players: 1, 
                name: sessionData.name,
                cardsPerPlayer: sessionData.cardsPerPlayer,
                cardsOnTable: sessionData.cardsOnTable
            }).then((res) => {
                commit('setSessionId', res.data.sessionId);
                commit('setPlayerId', res.data.players[0].playerId);
                commit('setName', res.data.players[0].name);
                commit('setPlayersInfo', res.data.players);
                $cookies.set('SessionId', res.data.sessionId, '1h');
                // UnitTests.testInitSession(state);
            }).catch((err) => console.log(err));
        },
        joinSession({ commit, state }, sessionData) {
            return axios.post(api_url + '/session/join', {
                name: sessionData.name,
                sessionId: sessionData.sessionId,
            }).then((res) => {
                commit('setSessionId', res.data.sessionId);
                commit('setPlayerId', res.data.players[res.data.players.length - 1].playerId);
                commit('setName', res.data.players[res.data.players.length - 1].name);
                commit('setPlayersInfo', res.data.players);
                $cookies.set('SessionId', res.data.sessionId, '1h');
                // UnitTests.testInitSession(state);
            }).catch((err) => console.log(err));
        },

        retrieveSession({ commit, state }, id) {
            return axios.get(api_url + '/session/current', {
                params: { sessionId: id.sessionId }
            }).then((res) => {
                commit('setSessionId', res.data.sessionId);
                commit('setPlayerId', state.playerId);
                 commit('setPlayerCards', res.data.players[state.playerId].cards);
                 commit('setTableCards', res.data.table);
                 commit('setCardsInDeck', res.data.deck);
                commit('setName', res.data.players[state.playerId].name);
                commit('setPlayersInfo', res.data.players);
                $cookies.set('SessionId', res.data.sessionId, '1h');
                //UnitTests.testInitSession(state);
            }).catch((err) => console.log(err));
        },

        drawCards({ commit, state }) {
            let oldPlayerCards = state.playerCards;
            let oldCardsInDeck = state.numCardsInDeck;

            axios.post(api_url + '/player/drawcard', {
                sessionId: state.sessionId,
                playerId: state.playerId,
                numOfCards: 1
            }).then((res) => {
                commit('setPlayerCards', res.data.cards);
                commit('setCardsInDeck', res.data.deck);
                UnitTests.testDrawCards(state, oldPlayerCards, oldCardsInDeck);
            }).catch((err) => console.log(err));
        },

        playCards({ commit, state }, payload) {
            axios.post(api_url + '/player/playcard', {
                sessionId: state.sessionId,
                playerId: state.playerId,
                cardIndex: payload.index,
                card: payload.card,
            }).then((res) => {
                commit('setPlayerCards', res.data.players[0].cards);
                commit('setTableCards', res.data.table);
            }).catch((err) => console.log(err));

        },
        distributeCards({ commit, state }, payload) {
            axios.post(api_url + '/session/distributecards', {
                sessionId: state.sessionId,
            }).then((res) => {
                commit('setPlayerCards', res.data.players[state.playerId].cards);
                commit('setTableCards', res.data.table);
                commit('setCardsInDeck', res.data.deck);
                commit('setName', res.data.players[state.playerId].name);
                commit('setPlayersInfo', res.data.players);
            }).catch((err) => console.log(err));

        },
        updatePlayerInfo({ commit, state }, sessionData) {
            commit('setSessionId', sessionData.sessionId);
            commit('setPlayersInfo', sessionData.players);
            $cookies.set('SessionId', sessionData.sessionId, '1h');
        }
    },
    getters: {
        getPlayerCards(state) {
            return state.playerCards;   // this will automatically track the changes of playerCards so you don't have to watch for it
        },

        getNumCardsInDeck(state) {
            return state.numCardsInDeck;
        },

        getTableCards(state) {
            return state.tableCards;
        },

        getSessionId(state) {
            return state.sessionId;
        },

        getName(state) {
            return state.name;
        },

        getPlayerId(state) {
            return state.playerId;
        },

        getPlayersInfo(state) {
            return state.playersInfo;
        },
    }
});
