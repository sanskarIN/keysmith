use crate::KeySmithError;

pub(crate) fn uniform_index(upper_bound: usize) -> Result<usize, KeySmithError> {
    if upper_bound == 0 {
        return Err(KeySmithError::EmptyCharacterSet);
    }

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

#[cfg(test)]
mod tests {
    use super::uniform_index;
    use crate::KeySmithError;

    #[test]
    fn zero_random_bound_fails_without_panicking() {
        assert_eq!(uniform_index(0), Err(KeySmithError::EmptyCharacterSet));
    }
}
