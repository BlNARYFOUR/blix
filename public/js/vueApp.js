Vue.component('leaderboard', {
    data: function () {
        return {
            ranking: []
        }
    },
    methods: {
        update: function () {
            this.ranking = [
                {name: 'BinaryFour', score: 9999},
                {name: 'Vermeon', score: 99}
            ]
        }
    },
    template: "<ul id=\"leaderboard\">\n" +
    "        <li v-for=\"(rank, index) in this.$parent.ranking\">\n" +
    "            <ul>\n" +
    "                <li>&#35;{{index + 1}}</li>\n" +
    "                <li>{{rank.name}}</li>\n" +
    "                <li>{{rank.score}}</li>\n" +
    "            </ul>\n" +
    "        </li>\n" +
    "    </ul>"
});

const app = new Vue({
    el: '#app',
    data: {
        ranking: [
            {name: 'Test01', score: 9999},
            {name: 'test02', score: 99},
            {name: 'test02', score: 99},
            {name: 'test02', score: 99},
            {name: 'test02', score: 99},
            {name: 'test02', score: 99},
            {name: 'test02', score: 99},
            {name: 'test02', score: 99},
            {name: 'test02', score: 99},
            {name: 'test02', score: 99}
        ],
        kills: 0,
        score: 99,
        rank: 11,
        amountOfPlayers: 20
    }
});
