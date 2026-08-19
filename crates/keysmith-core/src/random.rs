use crate::KeySmithError;

pub(crate) fn uniform_index(upper_bound: usize) -> Result<usize, KeySmithError> {
    debug_assert!(upper_bound > 0);
    let n = upper_bound as u128;
    let range = (u64::MAX as u128) + 1;
    let limit = range - (range % n);

    loop {
        let value = getrandom::u64().map_err(|_| KeySmithError::RandomSourceUnavailable)? as u128;
        if value < limit {
            return Ok((value % n) as usize);
        }
    }
}

pub(crate) fn secure_shuffle<T>(values: &mut [T]) -> Result<(), KeySmithError> {
    for i in (1..values.len()).rev() {
        let j = uniform_index(i + 1)?;
        values.swap(i, j);
    }
    Ok(())
}
