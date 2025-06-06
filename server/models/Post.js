// mongoose post có dạng như này
// {
//     "post_id": "1256333822621892",
//     "content": "Ra đường nên giữ bình tĩnh",
//     "author": {
//       "name": "Bao Le",
//       "link": "https://www.facebook.com/bao.le.576692"
//     },
//     "thumbnail_url": "https://scontent.fhan19-1.fna.fbcdn.net/v/t15.5256-10/503865881_595261896436543_2806631312636661237_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=100&ccb=1-7&_nc_sid=282d23&_nc_ohc=8A5ir_Q7jhIQ7kNvwF4XOUl&_nc_oc=AdnrbxXdVlx2uSLaG_9SPu2qiJmdajzyO8nVpzBUWuEi5w9OVgag7qM9OPcGQpHxPVUUE8zkbllDmVf8h7kMpbM2&_nc_zt=23&_nc_ht=scontent.fhan19-1.fna&_nc_gid=gV69gh4jtTpckyY1SIxYhA&oh=00_AfPM4rOX0rPBT2JIFkxVNNGMn-Oj1haFNgs1MJLt4rYz-g&oe=68486C67",
//     "video_url": "https://scontent.fhan19-1.fna.fbcdn.net/o1/v/t2/f2/m69/AQMV_hEoPJrr4efAcgAtfE8gRvqaR0AGl7jF263v6Twtnj0cOV3fvgdPpyZsodBmUIrrzEZdPO-FTAK7z3koFiR1.mp4?strext=1&_nc_cat=102&_nc_oc=AdnUokqZAMKovfVIL1ktlgeolhGYx0x86H2gIJtd0Igzg8NMuTcpKydLTDZ1zUf1vDQsgWFK9KNQmehtpyDqjKuE&_nc_sid=8bf8fe&_nc_ht=scontent.fhan19-1.fna.fbcdn.net&_nc_ohc=CWlZU-Ys8pUQ7kNvwGYZdMX&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMzYwLnN2ZV9zZCIsInhwdl9hc3NldF9pZCI6MTgwODkyNjE4Mjk4NDg3MywidmlfdXNlY2FzZV9pZCI6MTAxMjEsImR1cmF0aW9uX3MiOjYwLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&_nc_zt=28&oh=00_AfPVt5KQ7YtUvTOzl_fBsm-btstga6eWnm_zh92xjEJ0kQ&oe=68485370"
//   }

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    post_id: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },
    content: {
        type: String
    },
    author: {
        name: {
            type: String
        },
        link: {
            type: String
        }
    },
    thumbnail_url: {
        type: String
    },
    video_url: {
        type: String
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);