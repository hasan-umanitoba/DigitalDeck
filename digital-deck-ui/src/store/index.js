import { createStore } from 'vuex';
import axios from 'axios';
import UnitTests from './../scripts/UnitTests.js';

const URL = 'http://localhost:5000';

export default createStore({
    state: {
        sessionId: -1,
        playerId: -1,
        playerCards: null,
        tableCards: null,
        numCardsInDeck: -1,
        numPlayers: 0
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

        setNumPlayers(state, numPlayers){
            state.numPlayers = numPlayers;
        },

        flipCard(state, card) {
            var index = state.tableCards.indexOf(card);
            state.tableCards[index] = -1 * state.tableCards[index];
        }


    },
    actions: {
        initSession({ commit, state }, sessionData) {
            return axios.post(URL + '/session/new', {
                decks: sessionData.decks,
                players: 1,
                cardsPerPlayer: sessionData.cardsPerPlayer,
                cardsOnTable: sessionData.cardsOnTable
            }).then((res) => {
                commit('setSessionId', res.data.sessionId);
                commit('setPlayerId', res.data.players[0].playerId);
                commit('setPlayerCards', res.data.players[0].cards);
                commit('setTableCards', res.data.table);
                commit('setCardsInDeck', res.data.deck);
                commit('setNumPlayers', res.data.numPlayers);
                $cookies.set('SessionId', res.data.sessionId, '1h');
                UnitTests.testInitSession(state);
            }).catch((err) => console.log(err));
        },

        retrieveSession({ commit, state }, id) {
            return axios.get(URL + '/session/current', {
                params: { sessionId: id.sessionId}
            }).then((res) => {
                commit('setSessionId', res.data.sessionId);
                commit('setPlayerId', res.data.players[0].playerId);
                commit('setPlayerCards', res.data.players[0].cards);
                commit('setTableCards', res.data.table);
                commit('setCardsInDeck', res.data.deck);
                commit('setNumPlayers', res.data.numPlayers);
                $cookies.set('SessionId', res.data.sessionId, '1h');
                UnitTests.testInitSession(state);
            }).catch((err) => console.log(err));
        },

        drawCards({ commit, state }) {
            let oldPlayerCards = state.playerCards;
            let oldCardsInDeck = state.numCardsInDeck;

            axios.post(URL + '/player/drawcard', {
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
            axios.post(URL + '/player/playcard', {
                sessionId: state.sessionId,
                playerId: state.playerId,
                cardIndex: payload.index,
                card: payload.card,
            }).then((res) => {
                commit('setPlayerCards', res.data.players[0].cards);
                commit('setTableCards', res.data.table);
            }).catch((err) => console.log(err));

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

        getNumPlayers(state) {
            return state.numPlayers;
        },

        getSessionId(state){
            return state.sessionId;
        }
    }
});