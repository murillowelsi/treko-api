import chai from "chai";
import chaiHttp from "chai-http";
import taskModel from "../models/task"

chai.use(chaiHttp);

const app = require('../app');
const request = chai.request.agent(app);
const expect = chai.expect;

describe('get', () => {
    before((done) => {
        taskModel.deleteMany({});
        done();
    });

    context('quando eu tenho tarefas cadastradas', () => {
        before((done) => {
            let tasks = [
                { title: 'Estudar NodeJs', owner: 'murillo.welsi@gmail.com', done: false },
                { title: 'Estudar Ruby', owner: 'murillo.welsi@gmail.com', done: false },
                { title: 'Fazer compras', owner: 'murillo.welsi@gmail.com', done: false },
                { title: 'Estudar Python', owner: 'murillo.welsi@gmail.com', done: true }
            ]

            taskModel.insertMany(tasks);
            done();
        });

        it('deve retornar uma lista', (done) => {
            request
                .get('/task')
                .end((err, res) => {
                    expect(res).to.has.status(200);
                    expect(res.body.data).to.be.an('array');
                    done();
                })
        });

        it('deve filtrar por palavra-chave', (done) => {
            request
                .get('/task')
                .query({ title: 'Estudar' })
                .end((err, res) => {
                    expect(res).to.has.status(200);
                    expect(res.body.data[0].title).to.equal("Estudar NodeJs");
                    expect(res.body.data[1].title).to.equal("Estudar Ruby");
                    done();
                })
        });
    });

    context('quando eu busco uma tarefa especificando o id', () => {
        it('deve retornar uma única tarefa', (done) => {
            let tasks = [
                { title: 'Ler um livro de Js', owner: 'murillo.welsi@gmail.com', done: false }
            ]

            taskModel.insertMany(tasks, (err, result) => {
                let id = result[0]._id
                request
                    .get('/task/' + id)
                    .end((err, res) => {
                        expect(res).to.has.status(200);
                        expect(res.body.data.title).to.equal(tasks[0].title);
                        done();
                    })
            });
        });
    });

    context('quando o id especificado não existe', () => {
        it('deve retornar 404', (done) => {
            let id = require('mongoose').Types.ObjectId();
            request
                .get('/task/' + id)
                .end((err, res) => {
                    expect(res).to.has.status(404);
                    expect(res.body).to.eql({});
                    done();
                })
        });
    });
});