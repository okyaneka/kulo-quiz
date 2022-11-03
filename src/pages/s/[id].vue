<script setup lang="ts">
  import { getShare, setClickShare } from '~/apps/share/share.repositories'

  useQuery({
    queryKey: ['share'],
    queryFn: () => getShare(),
    onSuccess: async (share) => {
      if (typeof share != 'string') {
        await setClickShare(share.id)
        location.replace(share.urlin)
      }
    },
  })
</script>

<template>
  <el-skeleton animated> </el-skeleton>
</template>
