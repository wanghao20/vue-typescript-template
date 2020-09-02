
/**
 * Created by wh on 2020/8/31
 * author: wanghao
 * @desc：用户
 */
export class User {
	/**
	 * id
	 */
    public id: string = '';
    /**
     * 对应角色
     */
    public roles: string = '';
    /**
     * 用户名
     */
    public name: string = '';
    /**
     * 密码
     */
    public password: string = '';
    /**
     * creationTime
     */
    public creationTime: string = '';
    /**
     * 是否删除,0:否1:是
     */
    public isDelete: number = 0;
    /**
     * 权限名称
     */
    public rolesName: string = '';
}
