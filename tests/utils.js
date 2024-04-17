function arrayIsEqual(arr1, arr2) {
    if (arr1 === arr2) return true;
    if (arr1 == null || arr2 == null) return false;
    if (arr1.length !== arr2.length) return false;

    for (var i = 0; i < arr1.length; ++i) {
        if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
            // Recursive check
            if (!arrayIsEqual(arr1[i], arr2[i])) {
                return false;
            }
        } else if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

function arrayIsFloatEqual(arr1, arr2, precision=1e-9) {
    if (arr1 === arr2) return true;
    if (arr1 == null || arr2 == null) return false;
    if (arr1.length !== arr2.length) return false;

    for (var i = 0; i < arr1.length; ++i) {
        if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
            // Recursive check
            if (!arrayIsFloatEqual(arr1[i], arr2[i])) {
                return false;
            }
        } else if (Math.abs(arr1[i] - arr2[i]) > precision) {
            return false;
        }
    }
    return true;
}

function assertArrayEqual(arr1, arr2) {
    console.assert(
        arrayIsEqual(arr1, arr2),
        "array not equal",
        arr1,
        arr2
    );
}

function assertArrayFloatEqual(arr1, arr2, precision) {
    console.assert(
        arrayIsFloatEqual(arr1, arr2, precision),
        "array not equal",
        arr1,
        arr2
    );
}

function assertValueEqual(val1, val2) {
    console.assert(
        val1 == val2,
        "inequal values"
    );
}