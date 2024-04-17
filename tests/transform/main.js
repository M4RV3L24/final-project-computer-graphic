function main() {
    let tr, tr1, tr2;

    // Scale
    {
        tr = new Transform3();
        tr.scaleX(5);
        tr.scaleY(2);
        tr.scaleZ(1);

        assertArrayEqual(tr.matrix().arr(), [
            [5, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);

        tr.reset();
        tr.scale(1.5, 7, 2);
        assertArrayEqual(tr.matrix().arr(), [
            [1.5, 0, 0, 0],
            [0, 7, 0, 0],
            [0, 0, 2, 0],
            [0, 0, 0, 1]
        ]);

        tr = new Transform3();
        tr.scaleUniform(5);

        assertArrayEqual(tr.matrix().arr(), [
            [5, 0, 0, 0],
            [0, 5, 0, 0],
            [0, 0, 5, 0],
            [0, 0, 0, 1]
        ]);
    }

    // Translate
    {
        tr = new Transform3();
        tr.translateX(5);
        tr.translateY(2);
        tr.translateZ(1);

        assertArrayEqual(tr.matrix().arr(), [
            [1, 0, 0, 5],
            [0, 1, 0, 2],
            [0, 0, 1, 1],
            [0, 0, 0, 1]
        ]);

        tr.reset();
        tr.translate(1.5, 7, 2);
        assertArrayEqual(tr.matrix().arr(), [
            [1, 0, 0, 1.5],
            [0, 1, 0, 7],
            [0, 0, 1, 2],
            [0, 0, 0, 1]
        ]);

        tr = new Transform3();
        tr.translateUniform(5);

        assertArrayEqual(tr.matrix().arr(), [
            [1, 0, 0, 5],
            [0, 1, 0, 5],
            [0, 0, 1, 5],
            [0, 0, 0, 1]
        ]);
    }

    // Rotate
    {
        tr = new Transform3();
        tr.rotateX(Math.PI/2);

        assertArrayFloatEqual(tr.matrix().arr(), [
            [1, 0, 0, 0],
            [0, 0, -1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1]
        ]);

        tr.rotateX(-Math.PI/2);
        assertArrayFloatEqual(tr.matrix().arr(), [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);

        tr1 = new Transform3();
        tr1.rotateX(Math.PI/2);
        tr1.rotateX(-Math.PI/4);

        tr2 = new Transform3();
        tr2.rotateX(Math.PI/4);
        assertArrayFloatEqual(tr1.matrix().arr(), tr2.matrix().arr());


        tr = new Transform3();
        tr.rotateY(Math.PI/2);

        assertArrayFloatEqual(tr.matrix().arr(), [
            [0, 0, 1, 0],
            [0, 1, 0, 0],
            [-1, 0, 0, 0],
            [0, 0, 0, 1]
        ]);

        tr.rotateY(-Math.PI/2);
        assertArrayFloatEqual(tr.matrix().arr(), [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);

        tr1 = new Transform3();
        tr1.rotateY(Math.PI/2);
        tr1.rotateY(-Math.PI/4);

        tr2 = new Transform3();
        tr2.rotateY(Math.PI/4);
        assertArrayFloatEqual(tr1.matrix().arr(), tr2.matrix().arr());


        tr = new Transform3();
        tr.rotateZ(Math.PI/2);

        assertArrayFloatEqual(tr.matrix().arr(), [
            [0, -1, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);

        tr.rotateZ(-Math.PI/2);
        assertArrayFloatEqual(tr.matrix().arr(), [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);

        tr1 = new Transform3();
        tr1.rotateZ(Math.PI/2);
        tr1.rotateZ(-Math.PI/4);

        tr2 = new Transform3();
        tr2.rotateZ(Math.PI/4);
        assertArrayFloatEqual(tr1.matrix().arr(), tr2.matrix().arr());


        tr = new Transform3();
        tr.rotateX(Math.PI/2);
        tr.rotateY(Math.PI/2);
        tr.rotateZ(Math.PI/2);
        tr.rotateZ(-Math.PI/2);
        tr.rotateY(-Math.PI/2);
        tr.rotateX(-Math.PI/2);
        assertArrayFloatEqual(tr.matrix().arr(), [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);


        tr = new Transform3();
        tr.rotateX(Math.PI/2);
        tr.rotateY(Math.PI/2);
        tr.rotateZ(Math.PI/2);
        assertArrayFloatEqual(tr.matrix().arr(), [
            [0, 0,  1, 0],
            [0, 1, 0, 0],
            [-1,  0, 0, 0],
            [0, 0, 0, 1]
        ]);
    }

    console.log("All Transform3 tests done!");
}

window.onload = main;